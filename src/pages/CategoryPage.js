import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { ToastContainer, toast } from "react-toastify";
import CropEasy from './Crop';
import {

} from '@mui/icons-material';
import "react-image-crop/dist/ReactCrop.css";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LoadingButton } from "@mui/lab";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useNavigate } from "react-router-dom";
import { AppWidgetSummary } from '../sections/@dashboard/app'

import {
  Card,
  TextField,
  Table,
  Stack,
  InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Select,
  Paper,
  Avatar,
  Button,
  Popover,
  FormControl,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Grid,
  Container,
  Typography,
  IconButton,
  Input,
  TableContainer,
  TablePagination,
  LinearProgress,
} from '@mui/material';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { urlAdmin } from '../environment'
import { UserListHeadNew, UserListToolbar, UserListReportBar } from '../sections/@dashboard/user';


const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'imageName', label: 'Quantity', alignRight: false },
  { id: 'revenue', label: 'Revenue', alignRight: false },
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
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => {
      const nameMatch = _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
      const descriptionMatch = _user.description.toString().indexOf(query) !== -1;
      const weightMatch = _user.weight.toString().indexOf(query) !== -1;
      const barcodeMatch = _user.barcode.toString().indexOf(query) !== -1;
      const dropShipPrice = _user.dropshipPrice.toString().indexOf(query) !== -1;

      return nameMatch || descriptionMatch || weightMatch || barcodeMatch || dropShipPrice;
    });
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function UserPage() {
  const [open, setOpen] = useState(null);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);


  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');
  const [Value, setValue] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [selectedRange, setSelectedRange] = useState([
    dayjs(''),
    dayjs(''),
  ]);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const token = "Bearer " + localStorage.getItem("loginToken");
  const [addingNew, setAddingNew] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [Open2, setOpen2] = useState(false);
  const [Open6, setOpen6] = useState(false);
  const [Open4, setOpen4] = useState(false);
  const [image, setImage] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [category, setCategory] = useState("");
  const [TotalRevenue, setTotalRevenue] = useState(0);
  const [file, setFile] = useState(null);
  const [photoURL, setPhotoURL] = useState();
  const [openCrop, setOpenCrop] = useState(false);
  const [stockName, setStockName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [weight, setWeight] = useState("");
  const [dropshipPrice, setDropshipPrice] = useState("");
  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [TotalQuantity, setTotalQuantity] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rrp, setRrp] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);



  useEffect(() => {
    fetchProducts();
    fetchCategories();
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

  const fetchProducts = (e, pageNumber) => {
    setProductsLoaded(false);
    setActivePage(pageNumber)
    // const url = `https://apis.rubypets.co.uk/admin/dashboard/revenue`;

    fetch(`https://apis.rubypets.co.uk/admin/dashboard/revenue`, {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({

      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode == 401) {
          navigate("/login");
        }
        setProducts(data.data.totalRevenueList);
        let total_revenue = 0
        data.data.totalRevenueList.map((item) => {
          total_revenue += item.revenue
        })
        setTotalRevenue(total_revenue)
        setProductsLoaded(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };


  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPhotoURL(URL.createObjectURL(file));
      setOpenCrop(true);
      handleOpen6()
    }
  };




  const addProduct = (event) => {
    event.preventDefault();
    setShowSpinner(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("categoriesId", parseInt(category));
    formData.append("name", name);
    formData.append("stockName", stockName);
    formData.append("barcode", barcode);
    formData.append("weight", weight);
    formData.append("description", description);
    formData.append("dropshipPrice", dropshipPrice);
    formData.append("rrp", rrp);
    formData.append("fullDescription", fullDescription);

    console.log("ForData : ", formData);

    fetch(`https://apis.rubypets.co.uk/admin/products/add`, {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setShowSpinner(false);

        if (data.statusCode == 200) {
          cancelEdit();
          setAddingNew(false);
          fetchProducts();
          setCategory("");
          toast.success("Product Added Successfully", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
          });
        }
      })
      .catch((error) => {
        toast.error("Error adding product", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
      });
  };






  const cancelEdit = () => {
    setName("");
    setPrice("");
    setImage(null);

    setSelectedProductId(null);
    setCategory("");
    setStockName("");
    setBarcode("");
    setWeight("");
    setDescription("");
    setDropshipPrice("");
    setRrp("");
    setFullDescription("");
    setSelectedImage(null);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    handleChange(event)
    setSelectedImage(URL.createObjectURL(file));
    setImage(file);
  };

  const handleOpen2 = () => {
    setOpen2(true);
  };

  const handleOpen6 = () => {
    setOpen6(true);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const fetchCategories = (e, pageNumber) => {

    fetch(`https://apis.rubypets.co.uk/admin/categories/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode == 401) {
          navigate("/login");
        }
        setCategories(data?.data?.categories);

      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = products?.map((n) => n.name);
      console.log(newSelecteds)
      setSelectedProduct(products?.map((n) => n))
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleFilterByName = (event) => {
    console.log(event)
    setPage(0);
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - products.length) : 0;

  const filteredUsers = applySortFilter(products, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;


  const handleChangePage = (event, newPage) => {
    setPage(newPage);

  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'e') {
      event.preventDefault();
    }
  };

  return (
    <>
      <Helmet>
        <title> Admin Panel </title>
      </Helmet>
      <ToastContainer />

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Report
          </Typography>
          {addingNew && (
            <Button
              className="btn btn-primary"
              onClick={() => setAddingNew(false)}
            >
              Back to Report
            </Button>
          )}
          { }
          <Stack direction="row" spacing={2}>

            {
            }
          </Stack>
          { }
        </Stack>


        {addingNew && (
          <div>
            <form onSubmit={addProduct} >
              <Grid container spacing={2} marginTop={2}>
                <Grid item xs={12}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Add New Product
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Name"
                    fullWidth
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="demo-simple-select-label">Category</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"

                      label='Category'
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Stock Name"
                    fullWidth
                    value={stockName}
                    required
                    onChange={(e) => setStockName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Barcode"
                    fullWidth
                    value={barcode}
                    required
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Weight"
                    fullWidth
                    type="number"
                    value={weight}
                    required
                    onKeyPress={handleKeyPress}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Dropship Price"
                    fullWidth
                    type="number"
                    value={dropshipPrice}
                    onKeyPress={handleKeyPress}

                    required
                    onChange={(e) => setDropshipPrice(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="RRP"
                    fullWidth
                    type="number"
                    value={rrp}
                    onKeyPress={handleKeyPress}

                    required
                    onChange={(e) => setRrp(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Description"
                    fullWidth
                    value={description}
                    required
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Input
                    accept="image/*"
                    id="image-upload-button"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  <label htmlFor="image-upload-button">
                    <Button variant="contained" component="span">
                      Upload Image
                    </Button>
                  </label>

                  {selectedImage && (
                    <div style={{ display: 'flex', justifyContent: 'start', position: 'relative' }}>
                      <img src={selectedImage}
                        alt="Uploaded"
                        width={190}
                        height={160}
                        style={{ marginTop: '16px', maxWidth: '100%' }}
                      />

                      <span style={{ cursor: 'pointer', position: 'absolute', left: '203px' }} onClick={() => setSelectedImage(null)}><Iconify icon="wpf:delete" /></span>
                    </div>

                  )}

                </Grid>



                <Grid item xs={12}>
                  <TextField
                    label="Full Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={fullDescription}
                    required
                    onChange={(e) => setFullDescription(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    style={{ marginRight: "1rem" }}
                    type="submit"
                    loading={showSpinner}
                  >
                    {showSpinner ? "Adding ..." : "Add Product"}
                  </LoadingButton>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={cancelEdit}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </form>
          </div>
        )}

        {!addingNew && (

          <Card>
            <UserListReportBar setActivePage={setActivePage} setTotalRevenue={setTotalRevenue} setProducts={setProducts} setProductsLoaded={setProductsLoaded} selectedRange={selectedRange} setSelectedRange={setSelectedRange} handleOpen2={handleOpen2} numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />
            {productsLoaded ?
              <>
                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <Table>
                      <UserListHeadNew
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={products.length}
                        numSelected={selected.length}
                        handleOpen2={handleOpen2}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />
                      {categoriesLoaded ? (<Box sx={{ display: 'flex' }}>
                        <CircularProgress />
                      </Box>
                      ) : (<TableBody>
                        {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                          const { productName, productId, totalQuantity, revenue } = row;
                          const selectedUser = selected.indexOf(name) !== -1;

                          return (
                            <TableRow hover key={productId} tabIndex={-1} role="checkbox" selected={selectedUser}>
                              {
                              }
                              <TableCell align="left"></TableCell>

                              <TableCell component="th" scope="row" padding="none">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  { }
                                  <Typography variant="subtitle2" ml={2} noWrap>
                                    {productName}
                                  </Typography>
                                </Stack>
                              </TableCell>

                              <TableCell align="left">{totalQuantity}</TableCell>

                              <TableCell align="left">£{revenue.toFixed(2)}</TableCell>





                            </TableRow>
                          );
                        })}
                        {emptyRows > 0 && (
                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                          </TableRow>
                        )}
                      </TableBody>)}
                      {products?.length === 0 && (
                        <TableBody>

                          <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell align="center" colSpan={8} sx={{ py: 3 }}>
                              <Paper
                                sx={{
                                  textAlign: 'center',
                                }}
                              >
                                <Typography variant="h6" paragraph>
                                  Not Products Found
                                </Typography>
                              </Paper>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      )}

                      {isNotFound && (
                        <TableBody>
                          <TableRow>
                            <TableCell align="center" colSpan={8} sx={{ py: 3 }}>
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
              </>
              : <LinearProgress color="inherit" />}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={products.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>

        )}
        <Grid item textAlign={'right'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', textAlign: 'end' }} mt={3} >
          <label>Total Revenue <small>(Inc Tax & Shipping Fee)</small></label>

          <div style={{ border: '1px solid gray', width: '26%', borderRadius: '8px', padding: '10px', background: 'antiquewhite' }}>
            £{TotalRevenue.toFixed(2)}
          </div>
        </Grid>


      </Container>








    </>
  );
}
