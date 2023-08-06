import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import CropEasy from './Crop';

import {
  Typography,
  Button,
  Input,
  TextField,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import Iconify from "src/components/iconify/Iconify";
import { urlAdmin } from '../environment'




const ProductShowPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(false);
  const token = "Bearer " + localStorage.getItem("loginToken");
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
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
  const [Open6, setOpen6] = useState(false);
  const [file, setFile] = useState(null);
  const [photoURL, setPhotoURL] = useState();
  const [openCrop, setOpenCrop] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [weight, setWeight] = useState("");
  const [dropshipPrice, setDropshipPrice] = useState("");
  const [rrp, setRrp] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [open, setOpen] = useState(false);


  useEffect(() => {
    fetchProduct();
  }, []);






  const cancelEdit = () => {
    setIsEditing(false);
    setName("");
    setPrice("");
    setImage(null);
    setSelectedProductId(null);
    setStockName("");
    setBarcode("");
    setWeight("");
    setDescription("");
    setDropshipPrice("");
    setRrp("");
    setFullDescription("");
    setSelectedImage(null)
  };

  const updateProduct = (event) => {
    event.preventDefault();

    setShowSpinner(true);

    const productData = {
      name: name,
      stockName: stockName,
      description: description,
      barcode: barcode,
      weight: weight,
      dropshipPrice: dropshipPrice,
      rrp: rrp,
      fullDescription: fullDescription,
    };


    // let url =;

    fetch(
      `https://apis.rubypets.co.uk/admin/products/update/${selectedProductId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(productData),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.statusCode == 200) {
          if (image) {

            const formData = new FormData();
            formData.append("file", image);


            fetch(`https://apis.rubypets.co.uk/admin/products/image/update/${selectedProductId}`, {
              method: "POST",
              headers: {
                Authorization: token,
              },
              body: formData,
            }).then((response) => response.json()
            ).then((data) => {
              console.log("Data : ", data)
              if (data.statusCode == 200) {
                setShowSpinner(false);

                navigate("/dashboard/products");
                localStorage.setItem("updateMessage", "Product Updated Successfully")


              }
            }).catch((error) => {
              setShowSpinner(false);

              console.log(error)
            })

          }
          else {
            navigate("/dashboard/products");

            localStorage.setItem("updateMessage", "Product Updated Successfully")

          }
        }
      })
      .catch((error) => {

        console.error(error);
      });
  };

  const handleOpen6 = () => {
    setOpen6(true);
  };
  const handleClose6 = () => {
    setOpen6(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
    setImage(file);
    handleChange(event)
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


  const fetchProduct = async () => {
    fetch(`https://apis.rubypets.co.uk/admin/products/get/${id}`, {
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
        if (data.statusCode == 200) {
          let productData = data.data.product;

          setSelectedProductId(productData.id);
          setName(productData.name);
          setDescription(productData.description);
          setCategory(productData.categoriesName);
          setFullDescription(productData.fullDescription)
          setRrp(productData.rrp);
          setDropshipPrice(productData.dropshipPrice);
          setWeight(productData.weight);
          setBarcode(productData.barcode);
          setStockName(productData.stockName);
          setSelectedImage(productData.imageName);
          setProduct(true);

        }
      })
      .catch((error) => {
        console.error(error);
      });
  };





  const handleKeyPress = (event) => {
    if (event.key === 'e') {
      event.preventDefault();
    }
  };

  return (
    <>
      {product ?
        <>
          <Button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/products")}
          >
            Back to products
          </Button>
          < ToastContainer />
          <form onSubmit={updateProduct}>
            <Grid container spacing={2} marginTop={2}>
              <Grid item xs={12}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Edit Product
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

                <TextField
                  label="Category"
                  fullWidth
                  value={category}
                  disabled={true}
                />

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
                  value={weight}
                  onKeyPress={handleKeyPress}

                  type="number"
                  required
                  onChange={(e) => setWeight(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Dropship Price"
                  fullWidth
                  onKeyPress={handleKeyPress}

                  value={dropshipPrice}
                  type="number"
                  required
                  onChange={(e) => setDropshipPrice(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="RRP"
                  fullWidth
                  onKeyPress={handleKeyPress}

                  value={rrp}
                  type="number"
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
                  Update Product
                </LoadingButton>
                <Button
                  variant="contained"
                  color="secondary"
                  required
                  disabled={showSpinner}

                  onClick={cancelEdit}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </form>
          <Dialog open={Open6} onClose={handleClose6}>
            <DialogTitle>Crop Image</DialogTitle>
            <DialogContent>
              <CropEasy {...{ photoURL, setSelectedImage, setOpen6, setOpenCrop, setPhotoURL, setFile }} />



            </DialogContent>
            {
            }
          </Dialog>


        </>
        :
        <LinearProgress color="inherit" />
      }
    </>
  );
};

export default ProductShowPage;
