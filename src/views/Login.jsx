import { useState } from 'react'
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
function Login({getProducts, setIsAuth}){
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const handleInputChage = (e) => {
    const {name, value} = e.target;
    //console.log(name, value);
    setFormData((preData) => ({
      ...preData, [name]:value,
    }))
  }  
  //處理登入
  const onSubmit = async(e) => {
    try {
      e.preventDefault();
      const response = await axios.post(`${API_BASE}/admin/signin`, formData)
      //console.log(response)
      //設定cookie
      const {token, expired}=response.data;
      document.cookie = `userToken=${token};expires=${new Date(expired)};`;
      //設定 Authorization Header
      axios.defaults.headers.common['Authorization'] = token;
      //設定畫面
      setIsAuth(true);
      getProducts();  //登入就會取得產品列表，故需呼叫getProducts
    } catch (error) {
      setIsAuth(false);
      alert(`登入失敗訊息:${error.response.data.error.message}`);
    }
  }    
  return (
    <div className="container login">
      <h1 className="mb-3">請先登入</h1>
      <form className="form-floating" onSubmit={(e)=>onSubmit(e)}> 
        <div className="form-floating mb-3">
          <input type="email"className="form-control" id="email" name="username" placeholder="name@example.com" value={formData.username} onChange={(e) => handleInputChage(e)}/>
          <label htmlFor="floatingInput">Email address</label>
        </div>
        <div className="form-floating">
          <input type="password" className="form-control" id="password" name="password" placeholder="Password" value={formData.password} onChange={(e) => handleInputChage(e)}/>
          <label htmlFor="floatingPassword">Password</label>
        </div>
        <button type="submit" className='btn btn-primary mt-3 w-100'>登入</button>        
      </form>
    </div>
  )
}
export default Login