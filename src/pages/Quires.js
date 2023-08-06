import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import moment from 'moment';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useNavigate } from "react-router-dom";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import {
  Card,
  TextField,
  Stack,
  Button,
  Popover,
  Checkbox,
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
import { urlAdmin } from '../environment'

import { UserListHeadNew, UserListToolbar } from '../sections/@dashboard/user';


const TABLE_HEAD = [
  { id: 'from', label: 'From', alignRight: false },
  { id: 'readStatus', label: 'Read Status', alignRight: true },
  { id: 'replyStatus', label: 'Reply Status', alignRight: true },
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
      const nameMatch = _user.from.toLowerCase().indexOf(query.toLowerCase()) !== -1;
      const descriptionMatch = _user.replyStatus.toString().indexOf(query) !== -1;
      const weightMatch = _user.readStatus.toString().indexOf(query) !== -1;


      return nameMatch || descriptionMatch || weightMatch
    })
  }
  return stabilizedThis?.map((el) => el[0]);
}

export default function UserPage() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [Message, setMessage] = useState('');
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const token = "Bearer " + localStorage.getItem("loginToken");
  const [openFilter, setOpenFilter] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [ChatHistory, setChatHistory] = useState([]);
  const [Open1, setOpen1] = useState(false);

  const [categories, setCategories] = useState([]);
  const [activePage, setActivePage] = useState(1);

  const [AllPages, setAllPages] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [orderBy, setOrderBy] = useState('from');

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

    toast.success(updateMessage, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
    })


    toast.success(deleteMessage, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
    })


  }, []);

  const fetchCategories = (e, pageNumber) => {
    setCategoriesLoaded(false);
    setActivePage(pageNumber)

    fetch(`https://apis.rubypets.co.uk/admin/queries/list`, {
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
        setCategories(data?.data?.queries);

        setCategoriesLoaded(true);
      })
      .catch((error) => {

      });
  };

  function addCategory(event) {
    event.preventDefault()
    setShowSpinner(true);


    fetch(`https://apis.rubypets.co.uk/admin/queries/reply/${SelectedId}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        "Authorization": token
      },
      body: JSON.stringify({
        replyMessage: description
      }),
    })
      .then((response) => response.json())
      .then((data) => {

        fetchCategories();
        setAddingNew(false)
        cancelEdit();
        setShowSpinner(false);
        toast.success(
          "Reply Added Successfully",
          { position: toast.POSITION.TOP_CENTER, autoClose: 3000 },
        )


      })
      .catch((error) => {

      });
  }


  const cancelEdit = () => {
    setName("");
    setImage(null);
    setDescription("");
    setSelectedImage(null);
  };



  const handleCloseMenu = () => {
    setOpen(null);
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

  const getByID = (Id) => {
    fetch(`https://apis.rubypets.co.uk/admin/queries/details/${SelectedId}`, {
      method: "GET",
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
    })
      .then(response => response.json())
      .then(data => {


        setChatHistory(data?.data?.query?.chatHistory)
        setMessage(data?.data?.query?.message)
      })
      .catch((error) => {

      });
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
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
                Queries
              </Typography>
              {addingNew && (
                <Button
                  className="btn btn-primary"
                  onClick={() => { setAddingNew(false); fetchCategories() }}
                >
                  Back to Queries
                </Button>
              )}

            </Stack>


            {addingNew && (
              <div>
                <form onSubmit={addCategory} >
                  <Grid container spacing={2} marginTop={2}>
                    <Grid item xs={12}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        Reply Queries
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Message"
                        fullWidth
                        value={Message}
                        disabled
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Reply"
                        fullWidth
                        multiline
                        rows={4}
                        value={description}
                        required
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Grid>

                    <Box sx={{ width: '100%' }} mt={4}>

                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel2a-content"
                          id="panel2a-header"
                        >
                          <Typography>Chat History</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ width: '100%' }} >
                            <TableContainer component={Paper}>
                              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="center">Message</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {ChatHistory?.map((row) => (
                                    <TableRow
                                      key={row.createdAt}
                                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                      <TableCell component="th" scope="row">
                                        <div >{moment(row?.createdAt).format('YYYY-MM-DD , HH:mm')}</div>

                                      </TableCell>
                                      <TableCell align="center">{row.adminMessage}</TableCell>

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
                    </Box>

                    <Grid item xs={12}>
                      <LoadingButton
                        variant="contained"
                        color="primary"
                        style={{ marginRight: "1rem" }}
                        type="submit"
                        loading={showSpinner}
                      >
                        {showSpinner ? "Adding ..." : "Reply"}
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
                <UserListToolbar numSelected={selected?.length} filterName={filterName} onFilterName={handleFilterByName} />

                <Scrollbar>
                  <TableContainer sx={{ minWidth: 800 }}>
                    <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                      {categoriesLoaded ? <CircularProgress style={{ alignItems: 'center' }} size="medium" tip="Loading..." /> : null}
                    </div>
                    <Table>
                      <UserListHeadNew
                        order={order}
                        orderBy={orderBy}
                        headLabel={TABLE_HEAD}
                        rowCount={categories?.length}
                        numSelected={selected?.length}
                        onRequestSort={handleRequestSort}
                        onSelectAllClick={handleSelectAllClick}
                      />
                      <TableBody>
                        {filteredUsers?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row) => {
                          const { id, readStatus, replyStatus, from } = row;
                          const selectedUser = selected.indexOf(id) !== -1;

                          return (
                            <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                              <TableCell padding="checkbox">
                                <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, id)} />
                              </TableCell>

                              <TableCell component="th" scope="row" padding="none">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  { }
                                  <Typography variant="subtitle2" noWrap>
                                    {from}
                                  </Typography>
                                </Stack>
                              </TableCell>

                              <TableCell align="center">{readStatus ? <Button variant="outlined" color="success">
                                Read
                              </Button> : <Button variant="outlined" color="error">
                                unread
                              </Button>}</TableCell>

                              <TableCell align="center"> {replyStatus ? <Button variant="outlined" color="success">
                                Replied
                              </Button> : <Button variant="outlined" color="error">
                                Not replied
                              </Button>}</TableCell>



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
                                  Not Queries Found
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
            <MenuItem onClick={() => { setAddingNew(true); getByID(); handleCloseMenu() }}>
              <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
              Reply
            </MenuItem>


          </Popover>
        </>
        :
        <LinearProgress color="inherit" />

      }
    </>
  );
}
