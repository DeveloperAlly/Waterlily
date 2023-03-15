import { forwardRef, useState, useContext, useEffect } from 'react';
import {
  HeaderLayout,
  TitleLayout,
  SectionLayout,
  UserInputLayout,
  ArtistLayout,
  ArtistListLayout,
  ImageListLayout,
} from '@/layouts';
import {
  Logo,
  Title,
  Subtitle,
  Description,
  UserInput,
  ArtistCard,
  WalletButton,
  ImageHeader,
  CalloutMessage,
  ParrotLoader,
  TwitterLink,
} from '@/components';
import { artists } from '@/definitions/artists';
import {
  ContractContext,
  WalletContext,
  defaultWalletState,
  StatusContext,
  defaultStatusState,
  ImageContext,
} from '@/context';
import {
  IMAGE_NUMBER_ARRAY,
  getQuickImageURL,
} from '../context/ImageContextProvider';
import { ImageQuickCard } from '@/components';
import {
  CircularProgress,
  Box,
  Typography,
  Card,
  CardMedia,
  Button,
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { KeyboardDoubleArrowUpRounded } from '@mui/icons-material';

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const HomePage = () => {
  const [isCallout] = useState(true);
  const { customerImages } = useContext(ContractContext);

  const { walletState = defaultWalletState.walletState } =
    useContext(WalletContext);
  const {
    snackbar,
    closeSnackbar,
    statusState = defaultStatusState.statusState,
  } = useContext(StatusContext);
  const { quickImages, imagePrompt, imageArtist, setImageArtist, twitterLink } =
    useContext(ImageContext);

  const goToTop = () => {
    return document.getElementById('justAboveTextField')?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  };

  return (
    <>
      <HeaderLayout>
        <Logo height={40} />
        <WalletButton />
      </HeaderLayout>
      <TitleLayout>
        <Title />
        <Subtitle />
        <Description />
      </TitleLayout>
      {quickImages.length > 0 && (
        <SectionLayout>
          <ImageHeader />
          {Boolean(twitterLink) && <TwitterLink />}
          <ImageListLayout>
            {quickImages
              .filter((i) => (i.indexOf('combined') > 0 ? false : true))
              .map((quickImageURL, idx) => {
                return (
                  <ImageQuickCard
                    key={idx}
                    idx={idx}
                    image={{
                      link: quickImageURL,
                      alt: 'Not found',
                    }}
                    sx={{
                      maxWidth: 250,
                      border: '1px solid white',
                    }}
                  />
                );
              })}
          </ImageListLayout>
        </SectionLayout>
      )}
      {statusState.isError && (
        <SectionLayout>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ paddingTop: '1rem' }}>
              <Typography variant="h5">{statusState.isError}</Typography>
            </div>
          </Box>
        </SectionLayout>
      )}
      <div id="justAboveTextField"></div>
      <SectionLayout>
        {!walletState?.isConnected ? (
          <WalletButton />
        ) : !Boolean(statusState.isLoading) ? (
          <UserInputLayout>
            <UserInput
              initialPrompt={imagePrompt}
              initialArtist={imageArtist}
            />
          </UserInputLayout>
        ) : (
          <Box sx={{ padding: '0 1rem' }}>
            <CircularProgress size={80} />
            <div>{statusState.isLoading}</div>
            {statusState.isMessage && (
              <div>
                <div>{statusState.message?.title}</div>
                <div>{statusState.message?.description}</div>
              </div>
            )}
          </Box>
        )}
      </SectionLayout>
      <ArtistLayout>
        <Title
          text="Featured Artists"
          sx={{ fontSize: '3rem', paddingTop: '2rem' }}
        />
        <ArtistListLayout>
          {artists.map((artist, e) => {
            const { artistId, name, style, description, portfolio, image } =
              artist;
            return (
              <ArtistCard
                key={e}
                name={name}
                style={style}
                description={description}
                portfolio={portfolio}
                image={image}
                disabled={statusState.isLoading ? true : false}
                onClick={() => {
                  setImageArtist({
                    name,
                    key: artistId,
                    style,
                  });
                  goToTop();
                }}
              />
            );
          })}
        </ArtistListLayout>
        {isCallout && <CalloutMessage />}
      </ArtistLayout>
      <SectionLayout>
        <>
          <Title
            text="Your Generated Images"
            sx={{ fontSize: '3rem', paddingTop: '2rem' }}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {customerImages.length < 1 && (
              <Typography onClick={goToTop}>Generate an Image!</Typography>
            )}
            {/* MOVE TO COMPONENT */}
            {customerImages.map((image) => {
              const artist = artists.find((a) => a.artistId === image.artist);
              return (
                <Box
                  key={image.id.toString()}
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: 'solid 1px #fff',
                    width: '800px',
                    maxWidth: '800px',
                  }}
                >
                  <Typography gutterBottom variant="h6">
                    {image.prompt}
                  </Typography>
                  <Typography gutterBottom>{artist?.name}</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      mt: 2,
                    }}
                  >
                    {IMAGE_NUMBER_ARRAY.map((imageNumber) => {
                      return (
                        <Card
                          key={imageNumber}
                          sx={{
                            maxWidth: 250,
                            border: '1px solid white',
                            ml: 1,
                            mr: 1,
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={getQuickImageURL(
                              image.id.toNumber(),
                              imageNumber
                            )}
                          />
                        </Card>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
            <Box sx={{ padding: '1rem 0' }}>
              <Button
                onClick={goToTop}
                endIcon={<KeyboardDoubleArrowUpRounded />}
                aria-label="Back to Top"
              >
                Back to Top
              </Button>
            </Box>
          </Box>
        </>
      </SectionLayout>
      {snackbar.open && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={10000}
          onClose={closeSnackbar}
        >
          <Alert
            onClose={closeSnackbar}
            severity={snackbar.type as any}
            sx={{ width: '100%' }}
          >
            <Box
              sx={{
                color: '#fff',
              }}
            >
              {snackbar.message}
            </Box>
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default HomePage;
