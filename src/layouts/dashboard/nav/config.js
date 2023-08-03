import SvgColor from '../../../components/svg-color';

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: icon('ic_analytics'),
  },
  {
    title: 'products',
    path: '/dashboard/products',
    icon: icon('ic_cart'),
  },
  {
    title: 'Categories',
    path: '/dashboard/categories',
    icon: icon('ic_blog'),
  },
  {
    title: 'Orders',
    path: '/dashboard/orders',
    icon: icon('ic_blog'),
  }, {
    title: 'Queries',
    path: '/dashboard/queries',
    icon: icon('ic_blog'),
  },
  {
    title: 'Shipping Setting',
    path: '/dashboard/setting',
    icon: icon('ic_blog'),
  },
  {
    title: 'Report',
    path: '/dashboard/report',
    icon: icon('ic_blog'),
  },
  {
    title: 'logout',
    path: '/login',
    handler: true,
    icon: icon('ic_lock'),
  },
];

export default navConfig;
