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

            <Grid item xs={12} md={6} lg={8}>
              <AppWebsiteVisits
                title="Website Visits"
                subheader="(+43%) than last year"
                chartLabels={[
                  '01/01/2003',
                  '02/01/2003',
                  '03/01/2003',
                  '04/01/2003',
                  '05/01/2003',
                  '06/01/2003',
                  '07/01/2003',
                  '08/01/2003',
                  '09/01/2003',
                  '10/01/2003',
                  '11/01/2003',
                ]}
                chartData={[
                  {
                    name: 'Sales',
                    type: 'area',
                    fill: 'gradient',
                    data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                  },
                ]}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <AppCurrentVisits
                title="Current Visits"
                chartData={[
                  { label: 'America', value: 4344 },
                  { label: 'Asia', value: 5435 },
                  { label: 'Europe', value: 1443 },
                  { label: 'Africa', value: 4443 },
                ]}
                chartColors={[
                  theme.palette.primary.main,
                  theme.palette.info.main,
                  theme.palette.warning.main,
                  theme.palette.error.main,
                ]}
              />
            </Grid>

            {
            }

            {
            }

            {
            }

            <Grid item xs={12} md={6} lg={6}>
              <AppTrafficBySite
                title="Traffic by Site"
                list={[
                  {
                    name: 'FaceBook',
                    value: 323234,
                    icon: <Iconify icon={'eva:facebook-fill'} color="#1877F2" width={32} />,
                  },
                  {
                    name: 'Google',
                    value: 341212,
                    icon: <Iconify icon={'eva:google-fill'} color="#DF3E30" width={32} />,
                  },
                  {
                    name: 'Linkedin',
                    value: 411213,
                    icon: <Iconify icon={'eva:linkedin-fill'} color="#006097" width={32} />,
                  },
                  {
                    name: 'Twitter',
                    value: 443232,
                    icon: <Iconify icon={'eva:twitter-fill'} color="#1C9CEA" width={32} />,
                  },
                ]}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={6}>
              <AppOrderTimeline
                title="Order Timeline"
                list={[...Array(5)].map((_, index) => ({
                  id: faker.datatype.uuid(),
                  title: [
                    '1983, orders, $4220',
                    '12 Invoices have been paid',
                    'Order #37745 from September',
                    'New order placed #XF-2356',
                    'New order placed #XF-2346',
                  ][index],
                  type: `order${index + 1}`,
                  time: faker.date.past(),
                }))}
              />
            </Grid>

            {
            }
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
