import { useEffect, useState, useRef } from 'react'
import axios from 'axios';
import * as bootstrap from 'bootstrap'
import './assets/style.css'
import ProductModal from './components/productModal'
import Pagination from './components/Pagination';
import Login from './views/Login';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
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
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products?page=${page}`)  //網頁傳參數使用問號
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
      axios.defaults.headers.common['Authorization'] = token;
      //處理登入驗證
      const checkLogin = async() => {
        try {
          const response = await axios.post(`${API_BASE}/api/user/check`)
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
  const isStockEmpty = (stock) => stock == null || stock === "";
  
  return (
    <>
      {!isAuth ? (
        <Login getProducts={getProducts} setIsAuth={setIsAuth} />
      ) : (
        <div className="container">         
          <div className="row mt-5">           
            <h2>產品列表</h2>           
            <div className='text-end mb-3'>
              <button type="button" className='btn btn-primary' onClick={() => openModal("create", initailTempProduct)}>
                建立新的產品
              </button>              
            </div>              
                           
            <table className="table">
              <thead>
                <tr>
                  <th>分類</th>
                  <th>產品名稱</th>
                  <th>原價</th>
                  <th>售價</th>
                  <th>庫存</th>
                  <th>是否啟用</th>
                  <th>編輯</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((item) => (
                    <tr key={item.id}>
                      <td>{item.category}</td>
                      <td>{item.title}</td>
                      <td>{item.origin_price}</td>
                      <td>{item.price}</td>
                      <td className={isStockEmpty(item.in_stock) ? 'text-danger' : ''}>{isStockEmpty(item.in_stock)  ? "待更新" : item.in_stock}</td>
                      <td className={`${item.is_enabled ? 'text-success' : 'text-secondary'} fw-bold`}>{item.is_enabled ? "啟用" : "未啟用"}</td>
                      <td>
                        <div className="btn-group" role="group" aria-label="Basic outlined example">
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=> openModal("edit", item)}>編輯</button>   {/*此處要傳產品內容，所以對應的產品參數是map傳遞的參數item*/}
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => openModal("delete", item)}>刪除</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">尚無產品資料</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>                            
        </div>
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
