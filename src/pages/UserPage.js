import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from "react-router-dom";

// @mui
import {
  Card,
  TextField,
  InputLabel,
  Table,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Avatar,
  Button,
  Popover,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Grid,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  LinearProgress,
} from '@mui/material';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { urlAdmin } from '../environment'

// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'Image', label: 'Image', alignRight: false },
  { id: 'description', label: 'Description', alignRight: false },
  // { id: 'Original price', label: 'Verified', alignRight: false },
  // { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

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
      const nameMatch = _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
      const descriptionMatch = _user.description.toString().indexOf(query) !== -1;
      // Add more property filters as needed

      return nameMatch || descriptionMatch; // Return true if any property matches the query
    });
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
  const [openFilter, setOpenFilter] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [Open1, setOpen1] = useState(false);

  const [categories, setCategories] = useState([]);
  const [activePage, setActivePage] = useState(1);

  const [AllPages, setAllPages] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [Error1, setError1] = useState(false);
  const [Error, setError] = useState(false);
  const [image, setImage] = useState(null);
  const [image1, setImage1] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImage1, setSelectedImage1] = useState(null);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [SelectedId, setSelectedId] = useState('');


  const handleOpenMenu = (event, id) => {
    setOpen(event.currentTarget);
    setSelectedId(id)
  };



  useEffect(() => {
    fetchCategories();
    let deleteMessage = localStorage.getItem("deleteMessage");
    let updateMessage = localStorage.getItem("updateMessage");

    localStorage.removeItem("deleteMessage")
    localStorage.removeItem("updateMessage")

    // toast.success(updateMessage, {
    //   position: toast.POSITION.TOP_CENTER,
    //   autoClose: 3000,
    // })


    // toast.success(deleteMessage, {
    //   position: toast.POSITION.TOP_CENTER,
    //   autoClose: 3000,
    // })


  }, []);

  const fetchCategories = (e, pageNumber) => {
    setCategoriesLoaded(false);
    setActivePage(pageNumber)
    fetch(`https://apis.rubypets.co.uk/admin/categories/list`, {
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
        setCategories(data?.data?.categories);
        setAllPages(data?.data?.totalCount)

        setCategoriesLoaded(true);
      })
      .catch((error) => {

      });
  };



  function addCategory(event) {
    event.preventDefault()
    if (!image) {
      setError(true)

      return
    }
    else {
      setError(false)

    }
    if (!image1) {
      setError1(true)
      return
    }
    else {
      setError1(false)

    }
    setShowSpinner(true);

    // let file = image.concat(image1)
    // 
    const formData = new FormData();
    formData.append("file", image);
    formData.append("file", image1);
    formData.append("name", name);
    formData.append("description", description);

    fetch(`https://apis.rubypets.co.uk/admin/categories/add`, {
      method: "POST",
      headers: {
        "Authorization": token
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {

        fetchCategories();
        setAddingNew(false)
        cancelEdit();
        setShowSpinner(false);
        toast.success(
          "Category Added Successfully",
          { position: toast.POSITION.TOP_CENTER, autoClose: 3000 },
        )


      })
      .catch((error) => {

      });
  }


  const cancelEdit = () => {
    setName("");
    setImage(null);
    setImage1(null);
    setDescription("");
    setSelectedImage(null);
    setSelectedImage1(null);
  };


  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };


  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file.type === 'image/gif') {
      toast.error("GIF images are not allowed.", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
      // alert('GIF images are not allowed.');
      event.target.value = ''; // Clear the file input
      return;
    }
    setSelectedImage(URL.createObjectURL(file));
    setImage(file);
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

  const handleImageChange1 = (event) => {
    const file = event.target.files[0];
    if (file.type === 'image/gif') {
      toast.error("GIF images are not allowed.", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
      // alert('GIF images are not allowed.');
      event.target.value = ''; // Clear the file input
      return;
    }
    setSelectedImage1(URL.createObjectURL(file));
    setImage1(file);
  };


  const handleChangePage = (event, newPage) => {
    setPage(newPage);

  };


  const deleteProduct = () => {
    setShowSpinner(true);
    fetch(`https://apis.rubypets.co.uk/admin/categories/delete/${SelectedId}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    })
      .then((response) => {
        setShowSpinner(false)
        localStorage.setItem("deleteMessage", "Product Deleted Successfully")
        fetchCategories()
        handleClose1()
        handleCloseMenu()
        // navigate("/dashboard/products")
      })
      .catch((error) => {

      });
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    // 
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
                Categories
              </Typography>
              {addingNew && (
                <Button
                  className="btn btn-primary"
                  onClick={() => setAddingNew(false)}
                >
                  Back to Categories
                </Button>
              )}
              {!addingNew && (
                <Stack direction="row" spacing={2}>

                  <Button variant="outlined" onClick={() => setAddingNew(true)} startIcon={<Iconify icon="ic:baseline-plus" />}>
                    New Categories
                  </Button>

                </Stack>
              )}
            </Stack>


            {addingNew && (
              <div>
                <form onSubmit={addCategory} >
                  <Grid container spacing={2} marginTop={2}>
                    <Grid item xs={12}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        Add New Categories
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
                    <Grid item xs={12}>
                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={description}
                        required
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Grid>


                    <Grid item xs={12} sm={6}>
                      <InputLabel>Front Image</InputLabel>
                      <input
                        accept="image/*"

                        id="front-image-upload-button"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                      />
                      <label htmlFor="front-image-upload-button">
                        <Button variant="contained" component="span">
                          Upload Image
                        </Button>
                      </label>
                      {selectedImage && (
                        <div style={{ display: 'flex', justifyContent: 'start', position: 'relative' }}>
                          <img
                            src={selectedImage}
                            alt="Uploaded"
                            width={190}
                            height={160}
                            style={{ marginTop: '16px', maxWidth: '100%' }}
                          />
                          <span
                            style={{ cursor: 'pointer', position: 'absolute', left: '203px' }}
                            onClick={() => setSelectedImage(null)}
                          >
                            <Iconify icon="wpf:delete" />
                          </span>
                        </div>
                      )}
                      {Error && <p style={{ color: 'darkred' }}>Please Select Front Image</p>}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <InputLabel>Back Image</InputLabel>
                      <input
                        accept="image/*"
                        id="back-image-upload-button"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleImageChange1}
                      />
                      <label htmlFor="back-image-upload-button">
                        <Button variant="contained" component="span">
                          Upload Image
                        </Button>
                      </label>
                      {selectedImage1 && (
                        <div style={{ display: 'flex', justifyContent: 'start', position: 'relative' }}>
                          <img
                            src={selectedImage1}
                            alt="Uploaded"
                            width={190}
                            height={160}
                            style={{ marginTop: '16px', maxWidth: '100%' }}
                          />
                          <span
                            style={{ cursor: 'pointer', position: 'absolute', left: '203px' }}
                            onClick={() => setSelectedImage1(null)}
                          >
                            <Iconify icon="wpf:delete" />
                          </span>
                        </div>
                      )}
                      {Error1 && <p style={{ color: 'darkred' }}>Please Select Back Image</p>}

                    </Grid>

                    <Grid item xs={12}>
                      <LoadingButton
                        variant="contained"
                        color="primary"
                        style={{ marginRight: "1rem" }}
                        // onClick={addProduct}
                        type="submit"
                        loading={showSpinner}
                      >
                        {showSpinner ? "Adding ..." : "Add Category"}
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
                      // onSelectAllClick={handleSelectAllClick}
                      />
                      <TableBody>
                        {filteredUsers?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row) => {
                          const { id, name, frontImageName, description } = row;
                          const selectedUser = selected.indexOf(name) !== -1;

                          return (
                            <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                              {/* <TableCell padding="checkbox">
                                <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, name)} />
                              </TableCell> */}

                              <TableCell component="th" scope="row" paddingLeft="2">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  {/* <Avatar alt={name} src={avatarUrl} /> */}
                                  <Typography variant="subtitle2" noWrap>
                                    {name}
                                  </Typography>
                                </Stack>
                              </TableCell>

                              <TableCell align="left"><Avatar alt="Remy Sharp" src={frontImageName} /></TableCell>

                              <TableCell align="left">{description}</TableCell>



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
                                  Not Categories Found
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
                      {/* <Pagination
                        count={AllPages}
                        variant="outlined"
                        page={activePage}

                        shape="rounded"
                        onChange={(e, Value) => {
                          fetchCategories(e, Value);
                        }}
                      /> */}
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
              <p>Are you sure you want to delete this Categories ?</p>
              <ul>
                <li>
                  All the products in this category will be deleted too.
                </li>
              </ul>
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
            <MenuItem onClick={() => navigate(`/dashboard/categories/${SelectedId}`)}>
              <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
              Edit
            </MenuItem>

            <MenuItem onClick={handleOpen1} sx={{ color: 'error.main' }}>
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