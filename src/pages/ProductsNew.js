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

import { UserListHeadNew, UserListToolbar } from '../sections/@dashboard/user';


const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'imageName', label: 'Image', alignRight: false },
  { id: 'rrp', label: 'Retail Price', alignRight: false },
  { id: 'dropshipPrice', label: 'Drop Ship Price', alignRight: false },
  { id: 'weight', label: 'Weight (kg)', alignRight: false },
  { id: 'barcode', label: 'Bar Code', alignRight: false },
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
  const [openFilter, setOpenFilter] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [ExcelFile, setExcelFile] = useState(null);
  const [Open1, setOpen1] = useState(false);
  const [Open2, setOpen2] = useState(false);
  const [Open3, setOpen3] = useState(false);
  const [Open5, setOpen5] = useState(false);
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
  const [SelectedId, setSelectedId] = useState('');

  const [rrp, setRrp] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [srcImg, setSrcImg] = useState(null);
  const [crop, setCrop] = useState({ aspect: 16 / 9 });
  const [result, setResult] = useState(null);


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
    // const url = ;

    fetch(`https://apis.rubypets.co.uk/admin/products/list`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.statusCode == 401) {
          navigate("/login");
        }
        setProducts(data.data.products);
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

  const deleteProduct = () => {
    setShowSpinner(true);
    fetch(`https://apis.rubypets.co.uk/admin/products/delete/${SelectedId}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data)
        fetchProducts()
        if (data.statusCode == 200) {

          setShowSpinner(false)
          fetchProducts();

          toast.success("Product Deleted Successfully", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
          });
        }
        handleCloseMenu()
        setOpen1(false)


      })
      .catch((error) => {
        console.error(error);
      });
  };
  const deleteMultiProduct = (value) => {
    let deltedArray = []

    selectedProduct?.map((item) => {
      deltedArray?.push({
        id: item.id,
        image: item.imageName
      })

    })

    setShowSpinner(true);
    let Body;
    if (value === true) {
      Body = {
        "deleteAll": true
      }

    }
    else {
      Body = {
        "deleteAll": false,
        idsList: deltedArray,
      }
    }

    fetch(`https://apis.rubypets.co.uk/admin/products/delete-all`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(Body)
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data)
        fetchProducts()
        if (data.statusCode == 200) {
          setShowSpinner(false)
          fetchProducts();

          toast.success("Product Deleted Successfully", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
          });
          setSelected([])
        }
        handleClose2()
        handleClose4()
        handleCloseMenu()

      })
      .catch((error) => {
        console.error(error);
      });
  };

  const addProductFile = (event, file) => {
    event.preventDefault();
    setShowSpinner(true);
    handleOpen3()
    const formData = new FormData();
    formData.append("file", file);



    console.log("ForData : ", formData);

    fetch(`https://apis.rubypets.co.uk/admin/products/import`, {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        if (data.statusCode == 200) {
          toast.success("Product Added Successfully", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
          });
          fetchProducts();
          handleClose3()

        }
        else if (data.statusCode === 400) {
          toast.error(data.message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 3000,
          });
          handleClose3()

        }
      })
      .catch((error) => {
        handleClose3()


      });
  };



  const getReportDetail = (newRange) => {
    let obj = {}
    if (newRange) {
      obj = {
        "productId": SelectedId,
        "start": newRange && newRange?.length > 1 ? newRange[0] : '',
        "end": newRange && newRange?.length > 1 && newRange[1] ? newRange[1] : newRange[0] ? newRange[0] : ''
      }
    }
    else {
      obj = { "productId": SelectedId }
    }
    fetch(`https://apis.rubypets.co.uk/admin/dashboard/revenue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(
        obj
      ),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        if (data.statusCode == 200) {
          setTotalRevenue(data?.data?.totalRevenue)
          setTotalQuantity(data?.data?.totalQuantity)


        }

      })
      .catch((error) => {
        handleClose3()

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


  const handleDateChange = (newRange) => {
    console.log(newRange)
    setSelectedRange(newRange);
    getReportDetail(newRange)
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    // const selectedImage = event.target.files[0];

    if (file) {
      // Check if the selected file is a GIF image
      if (file.type === 'image/gif') {
        toast.error("GIF images are not allowed.", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3000,
        });
        // alert('GIF images are not allowed.');
        event.target.value = ''; // Clear the file input
        return;
      }
      handleChange(event)
      setSelectedImage(URL.createObjectURL(file));
      setImage(file);
    };
  }
  const handleChangeFiles = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
    addProductFile(event, file)
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };
  const handleOpen1 = () => {
    setOpen1(true);
  };
  const handleOpen2 = () => {
    setOpen2(true);
  };
  const handleOpen3 = () => {
    setOpen3(true);
  };
  const handleOpen5 = () => {
    setOpen5(true);
  };
  const handleOpen6 = () => {
    setOpen6(true);
  };
  const handleOpen4 = () => {
    setOpen4(true);
  };

  const handleClose1 = () => {
    setOpen3(false);
  };
  const handleClose3 = () => {
    setOpen3(false);
  };
  const handleClose4 = () => {
    setOpen4(false);
  };
  const handleClose2 = () => {
    setOpen2(false);
  };
  const handleClose6 = () => {
    setOpen6(false);
  };
  const handleClose5 = () => {
    setOpen5(false);
  };
  const handleOpenMenu = (event, id) => {

    setOpen(event.currentTarget);
    setSelectedId(id)
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

  const handleClick = (event, row) => {
    const selectedIndex = selected.indexOf(row.name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, row.name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }

    let filtered = products?.filter(person => newSelected.includes(person.name))
    setSelectedProduct(filtered)
    setSelected(newSelected);
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
      {productsLoaded ?
        <>
          <Container>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
              <Typography variant="h4" gutterBottom>
                Products
              </Typography>
              {addingNew && (
                <Button
                  className="btn btn-primary"
                  onClick={() => setAddingNew(false)}
                >
                  Back to Products
                </Button>
              )}
              {!addingNew && (
                <Stack direction="row" spacing={2}>

                  <Button variant="outlined" onClick={() => setAddingNew(true)} startIcon={<Iconify icon="ic:baseline-plus" />}>
                    New Product
                  </Button>
                  <Input
                    inputProps={{ accept: '.xlsx, .xls' }}

                    id="image-upload-button"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleChangeFiles}
                  />
                  <label htmlFor="image-upload-button">
                    <Button variant="outlined" color="success" component="span" startIcon={<Iconify icon="ic:baseline-upload" />}>
                      Upload
                    </Button>
                  </label>
                  <Button variant="outlined" color="error" onClick={() => { handleOpen4() }} startIcon={<Iconify icon="ic:baseline-delete" />}>
                    Delete All
                  </Button>

                </Stack>
              )}
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
                        label="Weight (kg)"
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
                        disabled={showSpinner}

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
                <UserListToolbar handleOpen2={handleOpen2} numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

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
                          const { id, name, imageName, description, barcode, weight, dropshipPrice, rrp } = row;
                          const selectedUser = selected.indexOf(name) !== -1;

                          return (
                            <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                              <TableCell padding="checkbox">
                                <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, row)} />
                              </TableCell>

                              <TableCell component="th" scope="row" padding="none">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  { }
                                  <Typography variant="subtitle2" noWrap>
                                    {name}
                                  </Typography>
                                </Stack>
                              </TableCell>

                              <TableCell align="left"><Avatar alt="Remy Sharp" src={imageName} /></TableCell>

                              <TableCell align="left">£{rrp}</TableCell>
                              <TableCell align="left">£{dropshipPrice}</TableCell>
                              <TableCell align="left">{weight}</TableCell>
                              <TableCell align="left">{barcode}</TableCell>



                              <TableCell align="right">
                                <IconButton size="large" color="inherit" onClick={(e) => handleOpenMenu(e, id)}>
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
          </Container>
          <Dialog open={Open1} onClose={handleClose1}>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogContent>
              <p>Are you sure you want to delete this Product?</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen1(false)} color="primary">
                Cancel
              </Button>
              <Button onClick={deleteProduct} color="error" loading={showSpinner}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>



          <Dialog open={Open2} onClose={handleClose2}>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogContent>
              <p>Are you sure you want to delete the Selected Products ?</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose2} color="primary">
                Cancel
              </Button>
              <Button onClick={deleteMultiProduct} color="error" loading={showSpinner}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={Open4} onClose={handleClose4}>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogContent>
              <p>Are you sure you want to delete all Products ?</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose4} color="primary">
                Cancel
              </Button>
              <Button onClick={() => deleteMultiProduct(true)} color="error" loading={showSpinner}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={Open3} onClose={handleClose3}>
            <DialogContent>
              {showSpinner && <div className='row' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '30vw', height: '200px' }}><CircularProgress size="6rem" /></div>}
              {!showSpinner && <p>File Successfully Uploaded</p>}
              {/* {!showSpinner && <p>File Format Not Supported Uploaded</p>} */}
            </DialogContent>
            <DialogActions>
              {/* <Button onClick={handleClose3} color="primary">
                Cancel
              </Button>
              <Button onClick={handleClose3} color="primary" loading={showSpinner}>
                Ok
              </Button> */}
            </DialogActions>
          </Dialog>

          <Dialog open={Open5} onClose={handleClose5}>
            <DialogTitle>Product Report</DialogTitle>
            <DialogContent>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DateRangePicker']}>
                  <DateRangePicker
                    value={selectedRange}

                    onChange={handleDateChange} localeText={{ start: 'start-date', end: 'end-date' }} />
                </DemoContainer>
              </LocalizationProvider>
              <Grid container spacing={2}>

                <Grid item xs={6} sm={6} md={6} mt={3}>
                  <AppWidgetSummary title="Total Revenue" total={TotalRevenue} color="error" icon={'iconoir:reports'} />
                </Grid>
                <Grid item xs={6} sm={6} md={6} mt={3}>
                  <AppWidgetSummary title="Total Quantity" total={TotalQuantity} color="error" icon={'iconoir:reports'} />
                </Grid>

              </Grid>

            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose5} color="primary">
                Cancel
              </Button>
              <Button onClick={handleClose5} color="primary" loading={showSpinner}>
                Ok
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={Open6} onClose={handleClose6}>
            <DialogTitle>Crop Image</DialogTitle>
            <DialogContent>
              <CropEasy {...{ photoURL, setSelectedImage, setOpen6, setOpenCrop, setPhotoURL, setFile }} />



            </DialogContent>
            {
            }
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
            <MenuItem onClick={() => navigate(`/dashboard/products/${SelectedId}`)}>
              <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
              Edit
            </MenuItem>

            <MenuItem onClick={() => { handleOpen1(); handleCloseMenu() }} sx={{ color: 'error.main' }}>
              <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
              Delete
            </MenuItem>
          </Popover>
        </>
        :
        <LinearProgress color="inherit" />
      }
    </>
  );
}
