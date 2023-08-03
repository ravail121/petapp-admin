import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, LinearProgress } from '@mui/material';
import Iconify from '../components/iconify';
import {
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
} from '../sections/@dashboard/app';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlAdmin } from '../environment'


export default function DashboardAppPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [totalProducts, setTotalProducts] = useState(null);
  const [checkAuth, setCheckAuth] = useState(false);
  const [totalCategories, setTotalCategories] = useState(null);

  useEffect(() => {
    const token = "Bearer " + localStorage.getItem('loginToken');
    const url = `https://apis.rubypets.co.uk/admin/dashboard/stats`;

    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.statusCode == 401) {
          navigate('/login')
        }
        setTotalProducts(data?.data);
      })
      .catch(error => {
        console.error(error);
      });

    fetch(`https://apis.rubypets.co.uk/admin/categories/list`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.data)
        setTotalCategories(data?.data?.categories?.length);
        setCheckAuth(true);
      })
      .catch(error => {
        console.error(error);
      });

  }, []);


  return (
    <>

      <Helmet>
        <title>Admin Panel</title>
      </Helmet>

      {checkAuth ?
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 5 }}>
            Hi, Welcome back
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <AppWidgetSummary title="Total Products" total={totalProducts?.totalProductCount} icon={'eos-icons:products'} />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AppWidgetSummary title="Total Orders" total={totalProducts?.totalOrdersCount} color="info" icon={'carbon:categories'} />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AppWidgetSummary title="Unread Queries" total={totalProducts?.totalQueriesCount} color="warning" icon={'icon-park-twotone:transaction-order'} />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <AppWidgetSummary title="Total Revenue" total={'£' + totalProducts?.totalRevenue} color="error" icon={'iconoir:reports'} />
            </Grid>

          </Grid>
        </Container>
        :
        <>
          <LinearProgress color="inherit" />
        </>
      }

    </>
  );
}
