import { FC, ReactElement, useState, useContext, useMemo } from 'react';
// import { Watermark } from '@hirohe/react-watermark';
import {
  Box,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Link,
  Button,
  Chip,
  MobileStepper,
  IconButton,
} from '@mui/material';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  OpenInNewOutlined,
} from '@mui/icons-material';
import { ArtistModal } from '@/components';
import { WalletContext, ArtistData } from '@/context';
import {
  boxStyle,
  cardActionStyle,
  cardHeaderStyle,
  cardMediaContainer,
  cardMediaContentsStyle,
  cardMediaStyle,
  cardStyle,
  modalContainer,
  openModalIconStyle,
  stepperStyle,
} from '@/styles/artistCardStyles';

//TO DO fix this to work off artists definitions
interface ArtistCardProps {
  artist: ArtistData;
  disabled?: boolean;
  onClick?: () => void;
}

export const ArtistCard: FC<ArtistCardProps> = ({
  artist,
  disabled = false,
  onClick,
}): ReactElement => {
  const { walletState } = useContext(WalletContext);
  const [activeStep, setActiveStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const maxSteps = artist.thumbnails.length;

  const preloadedImages = useMemo(() => {
    const images = [];
    for (let i = 0; i < maxSteps; i++) {
      if (i !== activeStep) {
        const img = new Image();
        img.src = artist.thumbnails[i].link;
        images.push(img);
      }
    }
    return images;
  }, [artist, activeStep, maxSteps]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => {
      if (prevActiveStep === maxSteps - 1) {
        return 0;
      }
      const nextStep = prevActiveStep + 1;
      const nextImg = new Image();
      nextImg.src = artist.thumbnails[nextStep].link;
      return nextStep;
    });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => {
      if (prevActiveStep === 0) {
        return maxSteps - 1;
      }
      const prevStep = prevActiveStep - 1;
      const prevImg = new Image();
      prevImg.src = artist.thumbnails[prevStep].link;
      return prevStep;
    });
  };

  return (
    <Box sx={boxStyle}>
      <ArtistModal
        artist={artist}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
      />
      <Card sx={cardStyle}>
        <CardHeader
          title={
            <Typography variant="h5">{artist.name || 'Artist Name'}</Typography>
          }
          subheader={
            <>
              <Link
                href={artist.portfolio}
                target="_blank"
                rel="noreferrer"
                sx={{ paddingTop: '0.5rem' }}
              >
                <Typography variant="subtitle1">Artist Portfolio</Typography>
              </Link>
              <Typography
                sx={{
                  paddingTop: '0.5rem',
                  color: 'rgba(255, 255, 255, 0.7);',
                }}
              >
                {artist.category} {/*artist.artistType*/}
              </Typography>
            </>
            // <>
            //   <Typography sx={{ padding: 0 }}>
            //     {artist.period || 'Unknown'}
            //   </Typography>
            //   <Typography sx={{ padding: 0, fontSize: '0.8rem' }}>
            //     {artist.nationality || 'Nationality'}
            //   </Typography>
            // </>
          }
          sx={cardHeaderStyle}
        />
        <Box sx={cardMediaContainer}>
          {/* TODO: link should open a modal with their generated art examples */}
          {/* <Link href={artist.portfolio} target="_blank" rel="noreferrer"> */}
          {/* <Watermark text={artist.name || 'ArtistName'}> */}
          <Box sx={cardMediaContentsStyle}>
            <Box onClick={() => setModalOpen(true)} sx={modalContainer}>
              <CardMedia
                component="img"
                // height={210}
                // width={280}
                image={
                  artist.thumbnails[activeStep].link ||
                  './monet-water-lilies.jpeg'
                }
                alt={
                  artist?.thumbnails[activeStep]?.alt || 'Monet Water Lilies'
                }
                sx={cardMediaStyle}
              />
            </Box>
            <IconButton
              onClick={() => setModalOpen(true)}
              sx={openModalIconStyle}
            >
              <OpenInNewOutlined sx={openModalIconStyle} />
            </IconButton>
            <MobileStepper
              steps={maxSteps}
              position="static"
              activeStep={activeStep}
              sx={stepperStyle}
              nextButton={
                <Button
                  size="small"
                  onClick={handleNext}
                  disabled={maxSteps === 1}
                >
                  Next
                  <KeyboardArrowRight />
                </Button>
              }
              backButton={
                <Button
                  size="small"
                  onClick={handleBack}
                  disabled={maxSteps === 1}
                >
                  <KeyboardArrowLeft />
                  Back
                </Button>
              }
            />
          </Box>
          {/* <Link
            href={artist.portfolio}
            target="_blank"
            rel="noreferrer"
            sx={{ paddingTop: '0.5rem' }}
          >
            <Typography variant="subtitle1">Artist Portfolio</Typography>
          </Link> */}
          {/* </Watermark> */}
          {/* </Link> */}
        </Box>
        {/* <CardContent
          sx={{
            height: '270px',
            padding: '0.5rem',
          }}
        >
          <Typography sx={{ padding: 0, paddingBottom: '0.3rem' }}>
            {artist.style || 'Artist Style'}
          </Typography>
          <Box display="flex" flexWrap="wrap" justifyContent="center">
            {artist.tags.length > 0 &&
              artist.tags.map((tag) => {
                if (tag === '') return;
                return (
                  <Box mr={1} mb={0.5} key={tag}>
                    <Chip label={tag} variant="outlined" size="small" />
                  </Box>
                );
              })}
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ paddingTop: '0.5rem' }}
          >
            {artist.biography || 'Artist Description'}
          </Typography>
        </CardContent> */}
        <CardActions sx={cardActionStyle}>
          {walletState?.isConnected && (
            <Button variant="outlined" disabled={disabled} onClick={onClick}>
              Use This Style
            </Button>
          )}
        </CardActions>
      </Card>
    </Box>
  );
};
