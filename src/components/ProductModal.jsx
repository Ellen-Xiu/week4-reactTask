import { useEffect, useState } from "react";
import { createProductApi, updateProductApi, delProductApi, uploadImgApi} from "../utils/api";

function ProductModal({
  modalType,
  tempProduct,
  closeModal,
  getProducts
}) {
  //setTempProduct避免汙染原始元件，顧會在當下自己元件內建立，將原本setTempProduct改為setTempData以及tempProduct改為tempData
  const [tempData, setTempData] = useState(tempProduct);
  //每次變更後須重新設定setTempData
  useEffect(() => {
    setTempData(tempProduct);
  }, [tempProduct])

  const handleModalInputChange = (e) =>{
    const {name, value, checked, type} = e.target;
    setTempData((preData) => ({
      ...preData,
      [name]: type==='checkbox' ? checked : value,
    }))
  }   //因modal input與前一週登入input概念相同，可直接套過來修改

  const handleModalImageChange = (index, value) => {
    setTempData((pre)=>{
      const newImages = [...pre.imagesUrl];
      newImages[index] = value;

      //優化邏輯
      //新增部分(輸入連結完後會自動新增輸入框，不須按新增按鈕)
      if(value!=="" && index === newImages.length-1 && newImages.length < 5) {
        newImages.push("");
      }
      //刪除部分
      if(value === "" && newImages.length > 1 && newImages[newImages.length-1] === ""){
        newImages.pop();
      }

      return {
        ...pre,
        imagesUrl: newImages,
      }
    })
  }
  const handleAddImage = () =>{
    setTempData((pre) => {
      const newImages = [...pre.imagesUrl];
      //圖片網址輸入為空時不新增
      if(newImages[newImages.length-1] === ""){
        return pre;
      }
      newImages.push("");
      return {
        ...pre, 
        imagesUrl: newImages,
      }
    })
  }
  const handleDeleteImage = () => {
    setTempData((pre) => {
      const newImages = [...pre.imagesUrl];
      newImages.pop();
      return {
        ...pre,
        imagesUrl: newImages,
      }
    })
  }

  //更新產品
  const updateProduct = async (id) => {
    const productData = {
      data:{
        ...tempData,
        origin_price : Number(tempData.origin_price),   //因為取得資料為字串須轉為API規定格式
        price : Number(tempData.price),
        in_stock : Number(tempData.in_stock),
        is_enabled : tempData.is_enabled === true ? 1 : 0,
        imagesUrl: [...tempData.imagesUrl.filter((url => url !== ""))], //防呆網址為空
      }
    }
    try {
    if(modalType === 'edit') {
      await updateProductApi(id, productData);
    } else {
      await createProductApi(productData);
    }
      //成功取得API後須取得新資料及將modal關閉
      getProducts();
      closeModal();
    } catch (error) {
      alert(`新增產品失敗訊息: ${error.response.data.message}`);
    }
  }  
    //刪除產品
  const delProduct = async(id) => {
    try {
      const response = await delProductApi(id);
      //console.log(response);
      getProducts();
      closeModal();
    } catch (error) {
      alert(`刪除失敗訊息: ${error.response.data.message}`);
    }    
  }

  const uploadImg = async(e) => {
    const file = e.target.files?.[0];
    if(!file) {
      return console.log('沒有上傳的檔案');
    }
    //console.log(e);
    try {
      const formData = new FormData()
      formData.append('file-to-upload', file);
      const response = await uploadImgApi(formData);

      //替換主圖
      setTempData((pre) => ({
        ...pre,
        imageUrl: response.data.imageUrl,
      }))
    } catch (error) {
      alert(error.response.data.message)
    }
  }
  return (<div className="modal fade" id="productModal" tabIndex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className={`modal-header bg-${modalType === 'delete' ? 'danger' : 'dark'}`}>
            <h1 className="modal-title fs-5 text-white" id="productModalLabel">{modalType === 'delete' ? '刪除' : modalType === 'edit' ? '編輯' : '新增'}產品</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            { modalType === 'delete' ? (<p className='fs-3 fw-bold'>確定要刪除<span className='text-danger'>{tempData.title}</span>嗎?</p>) :
              (<div className='row'>
                <div className='col-4'>
                  <div className="mb-3">
                    <label htmlFor="fileUpload" className='form-label'>
                      上傳圖片
                    </label>
                    <input className="form-control" 
                    type="file" 
                    name="fileUpload" 
                    id="fileUpload"
                    accept=".jpg, .jpeg, .png"
                    onChange={(e) => uploadImg(e)} />
                  </div>
                  <div>
                    <label htmlFor="imageUrl" className='form-label'>輸入圖片網址</label>
                    <input type="text" id="imageUrl" name="imageUrl" placeholder="請輸入圖片連結" className='form-control mb-3' value={tempData.imageUrl} onChange={(e) => handleModalInputChange(e)}/>
                    
                    {tempData.imageUrl && <img src={tempData.imageUrl} alt="主圖" className='mb-3'/>}                    
                  </div>
                  <div>
                    {tempData.imagesUrl.map((item, index) => (
                      <div key={index}>
                        <label htmlFor={`imageLink_${index}`} className='form-label'>輸入圖片網址</label>
                        <input type="text" id={`imageLink_${index}`} name="imageLink" placeholder="請輸入圖片連結" className='form-control mb-3' value={item} onChange={(e) => handleModalImageChange(index, e.target.value)}/>
                        {item &&<img src={item} alt="副圖" className='mb-3'/>}
                      </div>
                    ))}                                                  
                  </div>
                  
                  { tempData.imagesUrl.length<5 &&  
                    <button className='btn btn-outline-primary w-100 mb-3' onClick={() => handleAddImage()}>新增圖片</button>
                  }
                                    
                  {tempData.imagesUrl.length >=1 && <button className='btn btn-outline-danger w-100' onClick={() => handleDeleteImage()}>刪除圖片</button> }
                                
                </div>
                <div className='col-sm-8'>
                  <div className='mb-4'>
                    <div className='mb-2'>
                      <label htmlFor="title" className='form-label'>標題</label>
                      <input type="text" id="title" name="title" placeholder="請輸入標題" className='form-control' value={tempData.title} onChange={(e) => handleModalInputChange(e)}/>                    
                    </div>

                    <div className='row'>
                      <div className='col-6'>
                        <label htmlFor="category" className='form-label'>分類</label>
                        <input type="text" id="category" name="category" placeholder="請輸入分類" className='form-control' value={tempData.category} onChange={(e) => handleModalInputChange(e)}/>                                        
                      </div>
                      <div className='col-6'>
                        <label htmlFor="unit" className='form-label'>單位</label>                    
                        <input type="text" id="unit" name="unit" placeholder="請輸入單位" className='form-control' value={tempData.unit} onChange={(e) => handleModalInputChange(e)}/>                                           
                      </div>
                      <div className='col-6'>
                        <label htmlFor="origin_price" className='form-label'>原價</label>
                        <input type="number" min="0" id="origin_price" name="origin_price" placeholder="請輸入原價" className='form-control' value={tempData.origin_price} onChange={(e) => handleModalInputChange(e)}/>                                       
                      </div>
                      <div className='col-6'>
                        <label htmlFor="price" className='form-label'>售價</label>
                        <input type="number" min="0" id="price" name="price" placeholder="請輸入售價" className='form-control' value={tempData.price} onChange={(e) => handleModalInputChange(e)}/>                    
                      </div>
                      <div className='col-6'>
                        <label htmlFor="in_stock" className='form-label'>庫存</label>
                        <input type="number" min="0" id="in_stock" name="in_stock" placeholder="請輸入庫存" className='form-control' value={tempData.in_stock} onChange={(e) => handleModalInputChange(e)}/>                    
                      </div>                      
                    </div>
                  
                  </div>

                  <div className='mb-4'>
                    <div className='mb-2'>
                      <label htmlFor="description" className='form-label'>產品描述</label>
                      <textarea type="text" id="description" name="description" placeholder="請輸入產品描述" className='form-control' value={tempData.description} onChange={(e) => handleModalInputChange(e)}/>                   
                    </div>
                    <div className='mb-2'>
                      <label htmlFor="content" className='form-label'>產品說明</label>
                      <textarea type="text" id="content" name="content" placeholder="請輸入產品說明" className='form-control' value={tempData.content} onChange={(e) => handleModalInputChange(e)}/>                   
                    </div>                    
                  </div>

                  
                  <div className="form-check d-inline-block">
                    <input className="form-check-input" type="checkbox" value="" id="is_enabled" name="is_enabled" checked={tempData.is_enabled} onChange={(e) => handleModalInputChange(e)}/>
                    <label className="form-check-label" htmlFor="is_enabled">
                      是否啟用
                    </label>
                  </div>                                                                        
                                    
                </div>
              </div>)
            }
            
          </div>
          <div className="modal-footer">
            {modalType === 'delete' ? (<button type="button" className="btn btn-danger" onClick={() => delProduct(tempData.id)}>刪除</button>) : (
              <>
                <button type="button" className="btn btn-outline-primary" data-bs-dismiss="modal" onClick={closeModal}>取消</button>
                <button type="button" className="btn btn-primary" onClick={() => updateProduct(tempData.id)}>確認</button>
              </>
            )}              
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal