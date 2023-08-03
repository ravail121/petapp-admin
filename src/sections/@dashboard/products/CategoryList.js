import PropTypes from 'prop-types';
// @mui
import { Grid } from '@mui/material';
import ShopCategoryCard from './CategoryCard';

// ----------------------------------------------------------------------

CategoryList.propTypes = {
  categories: PropTypes.array.isRequired,
};

export default function CategoryList({ categories , ...other  }) {
  return (
    <Grid container spacing={3} {...other}>
      {categories.map((category) => (
        <Grid key={category.id} item xs={12} sm={6} md={3}>
          <ShopCategoryCard category={category} />
        </Grid>
      ))}
    </Grid>
  );
}
