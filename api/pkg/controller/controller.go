package controller

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/bacalhau-project/waterlily/api/pkg/bacalhau"
	"github.com/bacalhau-project/waterlily/api/pkg/contract"
	"github.com/bacalhau-project/waterlily/api/pkg/store"
	"github.com/bacalhau-project/waterlily/api/pkg/types"
	"github.com/rs/zerolog/log"
)

type ControllerOptions struct {
	Bacalhau bacalhau.Bacalhau
	Contract contract.Contract
	Store    store.Store
}

type Controller struct {
	Bacalhau   bacalhau.Bacalhau
	Contract   contract.Contract
	Store      store.Store
	imageChan  chan<- *types.ImageCreatedEvent
	artistChan chan<- *types.ArtistCreatedEvent
}

func NewController(
	options ControllerOptions,
) (*Controller, error) {
	controller := &Controller{
		Bacalhau:   options.Bacalhau,
		Contract:   options.Contract,
		Store:      options.Store,
		imageChan:  make(chan *types.ImageCreatedEvent),
		artistChan: make(chan *types.ArtistCreatedEvent),
	}
	return controller, nil
}

func (c *Controller) Start(ctx context.Context) error {
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			default:
				time.Sleep(1 * time.Second)
				err := c.loop(ctx)
				if err != nil {
					log.Error().Msgf("Waterlily error in controller loop: %s", err.Error())
				}
			}
		}
	}()
	return nil
}

func (c *Controller) loop(ctx context.Context) error {
	var wg sync.WaitGroup
	errChan := make(chan error, 1)

	// Wrap the function in a closure and handle the WaitGroup and error channel
	runFunc := func(f func(context.Context) error) {
		defer wg.Done()
		if err := f(ctx); err != nil {
			select {
			case errChan <- err:
			default:
			}
		}
	}

	wg.Add(6)

	go runFunc(c.checkForNewArtists)
	go runFunc(c.checkForRunningArtists)
	go runFunc(c.checkForFinishedArtists)
	go runFunc(c.checkForNewImages)
	go runFunc(c.checkForRunningImages)
	go runFunc(c.checkForFinishedImages)

	go func() {
		wg.Wait()
		close(errChan)
	}()

	if err := <-errChan; err != nil {
		fmt.Printf("An error occurred: %v\n", err)
	} else {
		fmt.Println("All functions completed successfully")
	}

	return nil
}

// artists that have arrived in the database we should check exist in the
// smart contract - if the answer is no and the artist is > 24 hours old
// then we delete it
func (c *Controller) checkForNewArtists(ctx context.Context) error {
	// load the artists where bacalhau state is "Created"
	// for each artist, check if it exists in the smart contract
	// if no - then check the creation time
	// if created > 24 hours then delete
	// if yes it's in the smart contract then trigger the bacalhau training job
	// and record the id of the job in the database
	// and update the bacalhau state to "Running"
	newArtists, err := c.Store.ListArtists(ctx, store.ListArtistsQuery{
		OnlyNew: true,
	})
	if err != nil {
		return err
	}
	if len(newArtists) == 0 {
		return nil
	}
	log.Debug().Msgf("Found %d new artists", len(newArtists))
	contractIDs, err := c.Contract.GetArtistIDs(ctx)
	if err != nil {
		return err
	}
	for _, artist := range newArtists {
		// check if the artist.ID exists in the contractIDs array
		if containsString(contractIDs, artist.ID) {
			// trigger the artist training
			log.Debug().Msgf("Found new artist in contract: %s - triggering training", artist.ID)
			err = c.trainArtist(ctx, artist)
			if err != nil {
				return err
			}
		} else {
			// check if the creation time is > 24 hours
			// and delete the artist if it is
			if isOlderThan24Hours(artist.Created) {
				log.Debug().Msgf("Artist not found in contract > 24 hours later: %s - triggering delete", artist.ID)
				err = c.Store.DeleteArtist(ctx, artist.ID)
				if err != nil {
					return err
				}
			}
		}
	}
	return nil
}

// we need to check on the artists that are currently training
// as bacalhau jobs and update the job state if the bacalhau job has finished
func (c *Controller) checkForRunningArtists(ctx context.Context) error {
	// load the artists where bacalhau state is "Running"
	// for each artist, check the status of the bacalhau job
	// if the job is still running then continue
	// if the job is errored then update the bacalhau state to "Error"
	// if the job is complete then update the bacalhau state to "Complete"
	// if we error getting the state of the job then contunue (and assume network flake)
	return nil
}

// check for artists that have finished the bacalhau job but have not updated
// the smart contract
func (c *Controller) checkForFinishedArtists(ctx context.Context) error {
	// load the artists where the bacalhau state is "Complete" or "Error"
	// and the contract state is "None"
	// if the bacalhau state is "Complete" then call the "ArtistComplete" function
	// if the bacalhau state is "Error" then call the "ArtistError" function
	return nil
}

// check for new images that are in the smart contract and not in the database
// trigger the bacalhau job for any new images found
func (c *Controller) checkForNewImages(ctx context.Context) error {
	// load the image IDs from both the database and the smart contract
	// check if any exist in the smart contract and not in the database
	// insert any of these into the database
	// trigger the bacalhau inference job
	// and record the id of the job in the database
	// and update the bacalhau state to "Running"
	return nil
}

// check for images that are running on bacalhau
// update the image state on either failure or success
func (c *Controller) checkForRunningImages(ctx context.Context) error {
	// load the images where bacalhau state is "Running"
	// for each artist, check the status of the bacalhau job
	// if the job is still running then continue
	// if the job is errored then update the bacalhau state to "Error"
	// if the job is complete then update the bacalhau state to "Complete"
	// if we error getting the state of the job then contunue (and assume network flake)
	return nil
}

// check for images that have finished the bacalhau job but have not updated
// the smart contract
func (c *Controller) checkForFinishedImages(ctx context.Context) error {
	// load the images where the bacalhau state is "Complete" or "Error"
	// and the contract state is "None"
	// if the bacalhau state is "Complete" then call the "ImageComplete" function
	// if the bacalhau state is "Error" then call the "ImageCancelled" function
	return nil
}

func (c *Controller) trainArtist(ctx context.Context, artist *types.Artist) error {
	return nil
}
