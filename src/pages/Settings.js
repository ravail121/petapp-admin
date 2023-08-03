import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import { useNavigate } from "react-router-dom";
import { urlAdmin } from '../environment'


import {
  TextField,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Container,
  Typography,
  InputLabel,
  LinearProgress,
} from '@mui/material';


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

  const [Currency, setCurrency] = useState('');
  const [CurrencyName, setCurrencyName] = useState('');
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const token = "Bearer " + localStorage.getItem("loginToken");
  const [openFilter, setOpenFilter] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [Open1, setOpen1] = useState(false);

  const [Tax, setTax] = useState(0);
  const [Shipping, setShipping] = useState(0);


  const [showSpinner, setShowSpinner] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const [SelectedId, setSelectedId] = useState('');




  useEffect(() => {
    GetAllShipping();


  }, []);


  function addCategory(event) {
    event.preventDefault()
    if (Tax > 100) {
      toast.error(
        "Please add tax value less than 100",
        { position: toast.POSITION.TOP_CENTER, autoClose: 3000 },
      )
      return
    }
    setShowSpinner(true);


    fetch(`https://apis.rubypets.co.uk/admin/orders/shipping/costs/edit`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        "Authorization": token
      },
      body: JSON.stringify({
        "tax": Tax / 100,
        "shippingFee": Shipping,
        "currency": CurrencyName,
        "currencySign": Currency
      }),
    })
      .then((response) => response.json())
      .then((data) => {

        setShowSpinner(false);
        toast.success(
          "Shipping setting Update Successfully",
          { position: toast.POSITION.TOP_CENTER, autoClose: 3000 },
        )


      })
      .catch((error) => {

      });
  }




  const GetAllShipping = () => {
    setCategoriesLoaded(false)
    fetch(`https://apis.rubypets.co.uk/user/orders/shipping/costs`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {

        if (response.message === "Shipping Fee has been fetched Succesfully") {
          localStorage.setItem('currency', response?.data?.shippingFee[0].currencySign)
          setCategoriesLoaded(true)
          let obj = response?.data?.shippingFee[0]
          setTax(obj?.tax)
          setShipping(obj?.shippingFee)
          setCurrency(obj.currencySign)
          setCurrencyName(obj.currency)
        }
      })
      .catch((err) => {

      });
  };




  const currency_signs = [
    { name: "United States Dollar", value: "$" },
    { name: "Euro", "value": "€" },
    { name: "British Pound Sterling", "value": "£" },
    { name: "Swiss Franc", "value": "Fr" },
    { name: "Chinese Yuan", "value": "¥" },
    { name: "Swedish Krona", "value": "kr" },
  ]

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
    let filterData = currency_signs.filter(x => x.value === event.target.value);

    setCurrencyName(filterData[0].name);
  };
  const handleInput = (event) => {
    const numericValue = event.target.value.replace(/[^0-9.]/g, '');

    const dotIndex = numericValue.indexOf('.');
    if (dotIndex !== -1 && dotIndex !== numericValue.lastIndexOf('.')) {
      event.target.value = numericValue.slice(0, dotIndex) + numericValue.slice(dotIndex + 1);
    } else {
      event.target.value = numericValue;
    }

  };
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
                Shipping Setting
              </Typography>

            </Stack>



            <div>
              <form onSubmit={addCategory} >
                <Grid container spacing={2} marginTop={2}>


                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Shipping"
                      fullWidth
                      type='number'
                      defaultValue={Shipping}
                      onChange={(e) => setShipping(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Tax %"
                      fullWidth
                      onInput={handleInput}


                      defaultValue={Tax}
                      onChange={(e) => setTax(e.target.value)}
                      type='text'

                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel id="demo-simple-select-label">Currency</InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        defaultValue={Currency}
                        onChange={handleCurrencyChange}

                        label='Currency'
                      >
                        {currency_signs.map((category) => (
                          <MenuItem key={category.value} value={category.value}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>




                  <Grid item xs={12}>
                    <LoadingButton
                      variant="contained"
                      color="primary"
                      style={{ marginRight: "1rem" }}
                      type="submit"
                      loading={showSpinner}
                    >
                      {showSpinner ? "Adding ..." : "Update"}
                    </LoadingButton>

                  </Grid>
                </Grid>
              </form>
            </div>




          </Container>



        </>
        :
        <LinearProgress color="inherit" />

      }
    </>
  );
}
