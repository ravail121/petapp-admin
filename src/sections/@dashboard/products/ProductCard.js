import PropTypes from 'prop-types';
// @mui
import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
// utils
import { fCurrency } from '../../../utils/formatNumber';
// components
import Label from '../../../components/label';
import { ColorPreview } from '../../../components/color-utils';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

const StyledProductImg = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
});

// ----------------------------------------------------------------------

ShopProductCard.propTypes = {
  product: PropTypes.object,
};

export default function ShopProductCard({ product }) {
  const navigate = useNavigate();
  // const { categoriesId, description, id, imageName, name, price  } = product;

  const {
    barcode , categoriesId , description , dropshipPrice, weight, 
    fullDescription , id , imageName , name , rrp , stockName
  } = product;

  console.log("--->" , product)

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
          <StyledProductImg src={imageName} />
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography style={{ cursor: 'pointer' }} >
          <Link color="inherit"  underline="hover">
            <a
              onClick={() => navigate(`/dashboard/products/${id}`)} 
              variant="subtitle2" 
              noWrap
            >
              {name}
            </a>
          </Link>
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {/* <ColorPreview colors={colors} /> */}
          <Typography variant="subtitle1">
            <Typography
              component="span"
              variant="body1"
              sx={{
                color: 'text.disabled',
                textDecoration: 'line-through',
              }}
            >
              {rrp && fCurrency(rrp)}
            </Typography>
            &nbsp;
            {fCurrency(dropshipPrice)}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
