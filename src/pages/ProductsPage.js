import { Helmet } from "react-helmet-async";
import { useState, useEffect, createContext } from "react";
import {
  Container, Stack, Typography,
  Button, FormControl, Input,
  TextField, Grid, InputLabel,
  Select, MenuItem,
} from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from "@mui/material";
import {
  ProductSort,
  ProductList,
  ProductCartWidget,
  ProductFilterSidebar,

} from "../sections/@dashboard/products";
import { urlAdmin } from '../environment'

import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import { da } from "date-fns/locale";

// import FileUploadIcon from '@mui/icons-material/FileUpload';

export default function ProductsPage() {
  const navigate = useNavigate();
  const token = "Bearer " + localStorage.getItem("loginToken");
  const [openFilter, setOpenFilter] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [category, setCategory] = useState("");
  const [stockName, setStockName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [weight, setWeight] = useState("");
  const [dropshipPrice, setDropshipPrice] = useState("");
  const [rrp, setRrp] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  useEffect(() => {
    fetchCategories();

    fetchProducts();


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

  const fetchProducts = () => {
    setProductsLoaded(false);
    console.log("inside")

    fetch(`https://apis.rubypets.co.uk/admin/products/list/1/10`, {
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

  const fetchCategories = () => {
    fetch(`https://apis.rubypets.co.uk/admin/categories/list/1/10`, {
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
        setCategories(data.data.categories);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const addProduct = (event) => {
    event.preventDefault();
    setShowSpinner(true);

    const formData = new FormData();
    formData.append("file", image);
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

  const updateProduct = () => {
    setShowSpinner(true);

    const productData = {
      categoriesId: `${category}`,
      name: name,
      price: price,
      stockName: stockName,
      description: description,
      barcode: barcode,
      weight: weight,
      dropshipPrice: dropshipPrice,
      rrp: rrp,
      fullDescription: fullDescription,
    };

    fetch(`https://apis.rubypets.co.uk/admin/products/update/${selectedProductId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(productData)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        setShowSpinner(false);
        if (data.statusCode == 200) {
          cancelEdit();
          fetchProducts();
          toast.success(
            "Product Updated Successfully",
            { position: toast.POSITION.TOP_CENTER, autoClose: 3000 }
          );
        }
      })
      .catch(error => {
        console.error(error);
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



  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };


  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
    setImage(file);
  };


  const handleFileChange = (event) => {
    const file = event.target.files[0];

  }

  return (
    <>
      <Helmet>
        <title> Dashboard | Products </title>
      </Helmet>

      <ToastContainer />

      {productsLoaded ? (
        <Container>
          <Typography variant="h4" sx={{ mb: 5 }}>
            Products
          </Typography>
          {!addingNew && (
            <>
              <Button
                className="btn btn-primary"
                onClick={() => setAddingNew(true)}
              >
                + Add Product
              </Button>

              <Input
                accept="file/*"
                id="file-upload-button"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload-button">
                <Button variant="contained" component="span" color="success">
                  Import Data
                </Button>
              </label>
            </>

          )}
          {addingNew && (
            <Button
              className="btn btn-primary"
              onClick={() => setAddingNew(false)}
            >
              Back to products
            </Button>
          )}

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
                      <InputLabel>Category</InputLabel>
                      <Select
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
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Dropship Price"
                      fullWidth
                      type="number"
                      value={dropshipPrice}
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
                      <div>
                        <img src={selectedImage}
                          alt="Uploaded"
                          width="400"
                          height="200"
                          style={{ marginTop: '16px', maxWidth: '100%' }}
                        />
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
                      // onClick={addProduct}
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
            <>
              <Stack
                direction="row"
                flexWrap="wrap-reverse"
                alignItems="center"
                justifyContent="flex-end"
                sx={{ mb: 5 }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  flexShrink={0}
                  sx={{ my: 1 }}
                >
                  <ProductFilterSidebar
                    openFilter={openFilter}
                    onOpenFilter={handleOpenFilter}
                    onCloseFilter={handleCloseFilter}
                  />
                  <ProductSort />
                </Stack>
              </Stack>
              <ProductList products={products} />
              <ProductCartWidget />
            </>
          )}
        </Container>
      ) : (
        <LinearProgress color="inherit" />
      )}
    </>
  );
}
