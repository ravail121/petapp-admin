import PropTypes from 'prop-types';
// @mui
import { Grid , Typography } from '@mui/material';
import ShopProductCard from './ProductCard';

// ----------------------------------------------------------------------

ProductList.propTypes = {
  products: PropTypes.array.isRequired,
};

export default function ProductList({ products , ...other  }) {
  return (
    <Grid container spacing={3} {...other}>
      {
      products.lenght > 0 ? 
        products.map((product) => (
          <Grid key={product.id} item xs={12} sm={6} md={3}>
            <ShopProductCard product={product} />
          </Grid>
        ))
      : 
      <Typography variant="subtitle1" textAlign="center">
          No Products Yet
      </Typography>
      
      }
    </Grid>
  );
}
