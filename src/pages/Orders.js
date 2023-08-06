import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import moment from 'moment';
import StepLabel from '@mui/material/StepLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import { urlAdmin } from '../environment'

import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import {
  Card,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Button,
  Popover,
  MenuItem,
  Grid,
  Container,
  Typography,
  IconButton,
  TablePagination,
  LinearProgress,
} from '@mui/material';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

const steps = [
  'Select master blaster campaign settings',
  'Create an ad group',
  'Create an ad',
];
const TABLE_HEAD = [
  { id: 'orderNo', label: 'Order No', alignRight: false },
  { id: 'emailAddress', label: 'Email Address', alignRight: false },
  { id: 'totalAmount', label: 'Total Amount', alignRight: false },
  { id: 'orderStatus', label: 'Order Status', alignRight: false },
  { id: 'createdAt', label: 'Date', alignRight: false },
  { id: '' },
];


function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array?.map((el, index) => [el, index]);
  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => {
      const nameMatch = _user.orderNo.toLowerCase().indexOf(query.toLowerCase()) !== -1;
      const descriptionMatch = _user.emailAddress.toString().indexOf(query) !== -1;
      const weightMatch = _user.totalAmount.toString().indexOf(query) !== -1;
      const barcodeMatch = _user.orderStatus.toString().indexOf(query) !== -1;
      const dropShipPrice = _user.createdAt.toString().indexOf(query) !== -1;

      return nameMatch || descriptionMatch || weightMatch || barcodeMatch || dropShipPrice;
    })
  }
  return stabilizedThis?.map((el) => el[0]);
}

export default function UserPage() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const token = "Bearer " + localStorage.getItem("loginToken");
  const [OrderStatusDrop, setOrderStatusDrop] = useState('');
  const [DetailsOrder, setDetailsOrder] = useState({});
  const [addingNew, setAddingNew] = useState(false);
  const [Open1, setOpen1] = useState(false);

  const [categories, setCategories] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [selectedValue, setSelectedValue] = useState('');


  const [AllPages, setAllPages] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [OrderStatus, setOrderStatus] = useState([]);
  const [History, setHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const [orderBy, setOrderBy] = useState('');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [SelectedId, setSelectedId] = useState('');


  const handleOpenMenu = (event, id) => {
    setOpen(event.currentTarget);
    setSelectedId(id)
  };



  useEffect(() => {
    fetchOrdersStatus()

    fetchOrders();
    let deleteMessage = localStorage.getItem("deleteMessage");
    let updateMessage = localStorage.getItem("updateMessage");

    localStorage.removeItem("deleteMessage")
    localStorage.removeItem("updateMessage")

    toast.success(updateMessage, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
    })


    toast.success(deleteMessage, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
    })


  }, []);

  const fetchOrders = (e, pageNumber) => {
    setCategoriesLoaded(false);
    setActivePage(pageNumber)
    fetch(`https://apis.rubypets.co.uk/admin/orders/list`, {
      method: "GET",
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode == 401) {
          navigate("/login");
        }
        setCategories(data?.data?.orders);
        setSelectedValue(data?.data?.orders?.orderStatus)
        setCategoriesLoaded(true);
      })
      .catch((error) => {

      });
  };


  const fetchOrdersStatus = (e, pageNumber) => {
    setActivePage(pageNumber)
    fetch(`https://apis.rubypets.co.uk/admin/orders/status/list`, {
      method: "GET",
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode == 401) {
          navigate("/login");
        }
        setOrderStatus(data?.data?.statuses);

      })
      .catch((error) => {

      });
  };

  const AddOrdersStatus = () => {
    fetch(`https://apis.rubypets.co.uk/admin/orders/status/update/${SelectedId}`, {
      method: "POST",
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        'accept': 'application/json'

      },
      body: JSON.stringify({
        orderStatus: OrderStatusDrop
      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode == 401) {
          navigate("/login");
        }
        if (data.statusCode === 200) {
          toast.success(data.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
          })
          setAddingNew(false)
          fetchOrders()
        }


      })
      .catch((error) => {

      });
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleOpen1 = () => {
    setOpen1(true);
  };

  const handleClose1 = () => {
    setOpen1(false);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = categories?.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected?.slice(1));
    } else if (selectedIndex === selected?.length - 1) {
      newSelected = newSelected.concat(selected?.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected?.slice(0, selectedIndex), selected?.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);

  };


  const getOrderDetails = (Id) => {
    setAddingNew(true)
    handleCloseMenu()
    setShowSpinner(true);
    fetch(`https://apis.rubypets.co.uk/admin/orders/details/${Id}`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    })
      .then(response => response.json())
      .then(data => {

        setShowSpinner(false)
        setDetailsOrder(data?.data?.order)
        setName(data?.data?.order?.emailAddress)
        let Array = data?.data?.order?.history

        setHistory(Array)
      })
      .catch((error) => {

      });
  };


  const deleteProduct = () => {
    setShowSpinner(true);
    fetch(`https://apis.rubypets.co.uk/admin/products/delete/${SelectedId}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    })
      .then((response) => {
        setShowSpinner(false)
        localStorage.setItem("deleteMessage", "Product Deleted Successfully")
        handleClose1()
        handleCloseMenu()
      })
      .catch((error) => {

      });
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };



  const handleSelectChange = (event) => {
    setOrderStatusDrop(event.target.value);
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - categories?.length) : 0;

  const filteredUsers = applySortFilter(categories, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers?.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Admin Panel </title>
      </Helmet>
      <ToastContainer />

      {categoriesLoaded ?
        <>
          <Container>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
              <Typography variant="h4" gutterBottom>
                Orders
              </Typography>
              {addingNew && (
                <Button
                  className="btn btn-primary"
                  onClick={() => setAddingNew(false)}
                >
                  Back to Orders
                </Button>
              )}

            </Stack>


            {addingNew && (
              <div>
                <form >
                  <Grid container spacing={2} marginTop={2}>
                    <Grid item xs={12}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        Edit
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <InputLabel id="Order-No">Order No</InputLabel>

                      <TextField
                        labelId="Order-No"
                        fullWidth
                        value={DetailsOrder?.orderNo}
                        disabled={true}

                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InputLabel id="Order-No">Payment Id</InputLabel>

                      <TextField
                        labelId="Order-No"
                        fullWidth
                        value={DetailsOrder?.paymentId}
                        disabled={true}

                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InputLabel id="Email-Address">Email Address</InputLabel>

                      <TextField
                        lableId="Email-Address"

                        fullWidth
                        value={DetailsOrder?.emailAddress}
                        disabled={true}


                      />

                    </Grid>

                    {
                    }

                    <Grid item xs={12} sm={6}>
                      <InputLabel id="demo-simple-select-label">Order Status</InputLabel>

                      <FormControl fullWidth required>
                        <Select
                          labelId="demo-simple-select-label"
                          onChange={handleSelectChange}
                          label='Order Status'
                          defaultValue={OrderStatusDrop}
                        >
                          {OrderStatus?.map((category) => (
                            <MenuItem key={category.value} value={category.value}>
                              {category.value}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Box sx={{ width: '100%' }} mt={4}>
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                        >
                          <Typography>History</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ width: '100%' }} mt={4}>
                            <Stepper activeStep={History?.length - 1} alternativeLabel>
                              {History && History?.map((label, index) => (
                                <Step key={label?.newStatus}>
                                  <StepLabel className={index === History?.length - 1 ? 'green-step' : ''}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      {label?.newStatus}{'  '}
                                      { }
                                    </div>
                                  </StepLabel>
                                  <div style={{ textAlign: 'center' }}>{moment(label?.createdAt).format('YYYY-MM-DD , HH:mm')}</div>

                                </Step>
                              ))}
                            </Stepper>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel2a-content"
                          id="panel2a-header"
                        >
                          <Typography>Product Detail</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ width: '100%' }} >
                            <TableContainer component={Paper}>
                              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="center">Quantity</TableCell>
                                    { }
                                    <TableCell align="center">Stock number</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {DetailsOrder?.productDetails?.map((row) => (
                                    <TableRow
                                      key={row.product}
                                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                      <TableCell component="th" scope="row">
                                        {row.productName}
                                      </TableCell>
                                      <TableCell align="center">{row.quantity}</TableCell>
                                      { }
                                      <TableCell align="center">{row?.productStock}</TableCell>
                                      <TableCell align="right">£{row.amount}</TableCell>

                                    </TableRow>
                                  ))}

                                </TableBody>
                                {
                                }
                              </Table>
                            </TableContainer>

                          </Box>
                        </AccordionDetails>
                      </Accordion>
                      <Grid item textAlign={'left'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', textAlign: 'start' }} mt={3} >


                        <div style={{ border: '1px solid gray', width: '26%', borderRadius: '8px', padding: '10px', background: 'antiquewhite' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}> <label>Shipping Fee</label>   <span>=   £{DetailsOrder.shippingFee}</span></div> <br />
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>  <label>Tax</label>  <span>=   £{Number(DetailsOrder.totalTax).toFixed(2)}</span></div> <br />
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><label>Sub Total</label> <span>=   £{Number(DetailsOrder.subTotal).toFixed(2)}</span></div>
                        </div>
                      </Grid>
                    </Box>

                    <Grid item xs={12}>
                      <LoadingButton
                        variant="contained"
                        color="primary"
                        style={{ marginRight: "1rem" }}
                        onClick={AddOrdersStatus}
                        loading={showSpinner}
                      >
                        {showSpinner ? "Adding ..." : "Update"}
                      </LoadingButton>

                    </Grid>
                  </Grid>
                </form>
              </div>
            )}


            {!addingNew && (

              <Card>
                <UserListToolbar numSelected={selected?.length} filterName={filterName} onFilterName={handleFilterByName} />

                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                      {categoriesLoaded ? <CircularProgress style={{ alignItems: 'center' }} size="medium" tip="Loading..." /> : null}
                    </div>
                    <Table>
                      <UserListHead
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={categories?.length}
                        numSelected={selected?.length}
                        onRequestSort={handleRequestSort}
                      />
                      <TableBody>
                        {filteredUsers?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row) => {
                          const { id, orderNo, createdAt, emailAddress, subTotal, orderStatus } = row;
                          const selectedUser = selected.indexOf(id) !== -1;

                          return (
                            <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                              {
                              }

                              <TableCell component="th" scope="row" padding="none">
                                <Stack direction="row" alignItems="center" spacing={2} ml={2}>
                                  { }
                                  <Typography variant="subtitle2" noWrap>
                                    {orderNo}
                                  </Typography>
                                </Stack>
                              </TableCell>

                              <TableCell align="left">{emailAddress}</TableCell>

                              <TableCell align="left">£{subTotal ? Number(subTotal).toFixed(2) : 0}</TableCell>
                              <TableCell align="left">{orderStatus}</TableCell>
                              <TableCell align="left">{moment(createdAt).format('YYYY-MM-DD , HH:mm A')}</TableCell>

                              <TableCell align="right">
                                <IconButton size="large" color="inherit" onClick={(e) => { handleOpenMenu(e, id); setOrderStatusDrop(orderStatus) }}>
                                  <Iconify icon={'eva:more-vertical-fill'} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                          </TableRow>
                        )}
                      </TableBody>
                      {categories.length == 0 && (
                        <TableBody>

                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                              <Paper
                                sx={{
                                  textAlign: 'center',
                                }}
                              >
                                <Typography variant="h6" paragraph>
                                  Not Orders Found
                                </Typography>
                              </Paper>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      )}

                      {isNotFound && (
                        <TableBody>
                          <TableRow>
                            <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                              <Paper
                                sx={{
                                  textAlign: 'center',
                                }}
                              >
                                <Typography variant="h6" paragraph>
                                  Not found
                                </Typography>

                                <Typography variant="body2">
                                  No results found for &nbsp;
                                  <strong>&quot;{filterName}&quot;</strong>.
                                  <br /> Try checking for typos or using complete words.
                                </Typography>
                              </Paper>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      )}
                    </Table>
                  </TableContainer>
                </Scrollbar>
                <div className="row pt-70">
                  <div className="col-lg-12 d-flex justify-content-center" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '29px'
                  }}>
                    <div className="paginations-area">
                      {
                      }
                    </div>
                  </div>
                </div>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={categories.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Card>
            )}
          </Container>

          <Dialog open={Open1} onClose={handleClose1}>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogContent>
              <p>Are you sure you want to delete this Product?</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose1} color="primary">
                Cancel
              </Button>
              <Button onClick={deleteProduct} color="error" loading={showSpinner}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>


          <Popover
            open={Boolean(open)}
            anchorEl={open}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                p: 1,
                width: 140,
                '& .MuiMenuItem-root': {
                  px: 1,
                  typography: 'body2',
                  borderRadius: 0.75,
                },
              },
            }}
          >
            <MenuItem onClick={() => getOrderDetails(SelectedId)}>
              <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
              Edit
            </MenuItem>


          </Popover>
        </>
        :
        <LinearProgress color="inherit" />

      }
    </>
  );
}
