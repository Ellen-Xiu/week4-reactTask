import { useEffect, useState, useRef } from 'react'
import * as bootstrap from 'bootstrap'
import './assets/style.css'
import ProductModal from './components/productModal'
import Pagination from './components/Pagination';
import Login from './views/Login';
import { fetchProducts, setAuthToken, checkLoginApi } from './utils/api';
import ProductList from './views/productList';

//因為產品資料內容都相同，故抽出共用
const initailTempProduct = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
  in_stock: "",
};
function App() {

  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(initailTempProduct);
  const [modalType, setModalType] = useState('');
  const [pagination,setpagination] = useState({});

  const productModalRef = useRef(null);


  const getProducts = async(page = 1) => {
    try {
      const response = await fetchProducts(page);  //網頁傳參數使用問號
      setProducts(response.data.products);
      setpagination(response.data.pagination);
    } catch (error) {
      alert(`商品取得失敗訊息: ${error.response.data.message}`);
    }
  }
  useEffect(() => {
    const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("userToken="))
    ?.split("=")[1];
    //確定取得tokon後才將token放到header
    if(token) {
      setAuthToken(token);
      //處理登入驗證
      const checkLogin = async() => {
        try {
          const response = await checkLoginApi();
          //console.log(response);
          //驗證成功後要做的事:畫面狀態改為登入、取得產品
          setIsAuth(true);
          getProducts();
        } catch (error) {
          //console.log(error);
          alert(`登入失敗訊息:${error.response.data.message}`)
        }
      }    
      checkLogin(); //呼叫函式驗證登入      
    }

    //畫面好後才做綁modal DoM元素
    productModalRef.current = new bootstrap.Modal("#productModal", {
      keyboard: false,
    });
  },[]);

  //建立modal打開和關閉方法
  const openModal = (type, product) => {
    //console.log(product);   //確認點擊有取得產品資訊
    setModalType(type);
    setTempProduct((pre) => ({
      ...pre,
      ...product,
      imagesUrl: product.imagesUrl ? [...product.imagesUrl] : [""],
    }));
    productModalRef.current.show();
  }
  const closeModal = () => {
    productModalRef.current.hide();
  }
  
  return (
    <>
      {!isAuth ? (
        <Login getProducts={getProducts} setIsAuth={setIsAuth} />
      ) : (
        <ProductList products={products} openModal={openModal} initailTempProduct={initailTempProduct}/>
      )}
      <Pagination pagination={pagination} onChangePage={getProducts}/>
      {/*modal部分，因為不是在登入和列表頁面內，故放在外面，要不然會導致畫面邏輯錯誤*/}
      <ProductModal 
        modalType={modalType}
        tempProduct={tempProduct}
        closeModal={closeModal}
        getProducts={getProducts}
      />  
    </>
  );
}

export default App
