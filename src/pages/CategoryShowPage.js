import React, { useState, useEffect } from "react";
// import { makeStyles } from '@mui/styles';
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import {
  Container,
  Stack,
  Typography,
  Button,
  FormControl,
  CardContent,
  Card,
  CardMedia,
  Input,
  TextField,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { fromPairs } from "lodash";
import Iconify from "src/components/iconify/Iconify";
import { urlAdmin } from '../environment'



const CategoryShowPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(false);
  const token = "Bearer " + localStorage.getItem("loginToken");
  const navigate = useNavigate();
  // const classes = useStyles();

  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [selectedCategorytId, setSelectedCategoryId] = useState(null);
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
  const [selectedImage1, setSelectedImage1] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  const deleteProduct = () => {
    setShowSpinner(true);
    fetch(`https://apis.rubypets.co.uk/admin/categories/delete/${selectedCategorytId}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    })
      .then((response) => {
        setShowSpinner(false)
        localStorage.setItem("deleteMessage", "Category Deleted Successfully")
        navigate("/dashboard/categories")
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setName("");
    setImage(null);
    setSelectedCategoryId(null);
    setDescription("");
    setSelectedImage(null)
    setSelectedImage1(null)
  };

  const updateCategory = (event) => {
    event.preventDefault();

    setShowSpinner(true);

    const productData = {
      name: name,
      description: description,
    };


    // let url =;

    fetch(
      `https://apis.rubypets.co.uk/admin/categories/update/${selectedCategorytId}`,
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


            fetch(`https://apis.rubypets.co.uk/admin/categories/image/update/${selectedCategorytId}`, {
              method: "POST",
              headers: {
                Authorization: token,
              },
              body: formData,
            }).then((response) => response.json()
            ).then((data) => {
              console.log("Data : ", data)
              setShowSpinner(false);

              if (data.statusCode == 200) {
                navigate("/dashboard/categories");
                localStorage.setItem("updateMessage", "Category Updated Successfully")


              }
            }).catch((error) => {
              setShowSpinner(false);
              console.log(error)
            })

          }
          else {
            navigate("/dashboard/categories");
            localStorage.setItem("updateMessage", "Category Updated Successfully")

          }
        }
      })
      .catch((error) => {

        console.error(error);
      });
  };

  function updateImageCategory(event, flag) {
    // event.preventDefault()
    setShowSpinner(true);
    // let file = image.concat(image1)
    // console.log(file)
    const formData = new FormData();
    formData.append("file", event);
    formData.append("sideFlag", flag);


    fetch(`https://apis.rubypets.co.uk/admin/categories/image/update/${selectedCategorytId}`, {
      method: "POST",
      headers: {
        "Authorization": token
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)

        setShowSpinner(false);
        toast.success(
          "Category Updated Successfully",
          { position: toast.POSITION.TOP_CENTER, autoClose: 3000 },
        )


      })
      .catch((error) => {
        console.error(error);
      });
  }



  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
    setImage(file);
    updateImageCategory(file, 1)
  };
  const handleImageChange1 = (event) => {
    const file = event.target.files[0];
    setSelectedImage1(URL.createObjectURL(file));
    setImage(file);
    updateImageCategory(file, 0)

  };



  const fetchCategory = async () => {
    fetch(`https://apis.rubypets.co.uk/admin/categories/get/${id}`, {
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
          let categoryData = data.data.category;

          setSelectedCategoryId(categoryData.id);
          setName(categoryData.name);
          setDescription(categoryData.description);
          setSelectedImage(categoryData.frontImageName);
          setSelectedImage1(categoryData.imageName);
          setProduct(true);

        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  return (
    <>
      {product ?
        <>
          <Button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard/categories")}
          >
            Back to Categories
          </Button>
          < ToastContainer />
          <form onSubmit={updateCategory}>
            <Grid container spacing={2} marginTop={2}>
              <Grid item xs={12}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Edit Category
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
                  label="Full Description"
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
              </Grid>
              <Grid item xs={12}>
                <LoadingButton
                  variant="contained"
                  color="primary"
                  style={{ marginRight: "1rem" }}
                  // onClick={updateProduct}
                  type="submit"
                  loading={showSpinner}
                >
                  Update Category
                </LoadingButton>
                <Button
                  variant="contained"
                  color="secondary"
                  required
                  onClick={cancelEdit}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </form>



          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogContent>
              <p>Are you sure you want to delete this Category?</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={deleteProduct} color="error" loading={showSpinner}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>


        </>
        :
        <LinearProgress color="inherit" />
      }
    </>
  );
};

export default CategoryShowPage;