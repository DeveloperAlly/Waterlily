declare let window: any;
import { FC, ReactElement, useContext } from 'react';
import { Box, Button, Card, CardMedia, Link } from '@mui/material';
import { SxProps } from '@mui/system';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import {
  defaultWalletState,
  ImageContext,
  WalletContext,
  StatusContext,
  defaultStatusState,
  ContractContext,
} from '@/context';

//ipfs.io/ipfs/{cid} should be fine?

const boxStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: '1rem',
  cursor: 'pointer',
};

const downloadStyle = {
  position: 'absolute',
  top: 20,
  right: 25,
  cursor: 'pointer',
};

interface ImageCardProps {
  image: { link: string; alt: string; minted?: boolean };
  ipfs?: { link: string; alt: string; minted?: boolean };
  idx: number | string;
  sx?: SxProps;
  newImg?: boolean;
}

export const ImageQuickCard: FC<ImageCardProps> = ({
  image,
  ipfs,
  idx,
  sx = {},
  newImg = false,
}): ReactElement => {
  const { walletState = defaultWalletState.walletState } =
    useContext(WalletContext);
  const { imageArtist, imagePrompt, downloadImage } = useContext(ImageContext);
  const { mintNFT } = useContext(ContractContext);
  const { statusState = defaultStatusState.statusState } =
    useContext(StatusContext);
  let noSpacePrompt = imagePrompt.replace(/\s+/g, '').trim();
  // let artistName = imageArtist.name.replace(/\s+/g, '').trim();
  const fileName = `${noSpacePrompt.slice(0, 20)}-Image_${idx}`;
  const folderName = imageArtist.name.replace(/\s+/g, '').trim();

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={downloadStyle}
        onClick={() => downloadImage(image.link, folderName, fileName)}
      >
        <CloudDownloadIcon />
      </Box>
      <Box sx={boxStyle}>
        <Card sx={sx}>
          <Link
            href={image?.link || 'https://twitter.com/DeveloperAlly'}
            target="_blank"
            rel="noreferrer"
          ></Link>
          <CardMedia
            component="img"
            // height="200"
            image={image?.link || './monet-water-lilies.jpeg'}
            alt={image?.alt || 'Monet Water Lilies Placeholder Image'}
          />
        </Card>
      </Box>
      {/* pass in image link to the nftfunction - it has the rest 
      - probs should be it's own component*/}
      {newImg && (
        <Button
          variant="outlined"
          onClick={() => mintNFT(image)}
          disabled={
            !window.ethereum ||
            !walletState.accounts[0] ||
            Boolean(statusState.isLoading)
          }
        >
          Mint as NFT
        </Button>
      )}
    </Box>
  );
};
