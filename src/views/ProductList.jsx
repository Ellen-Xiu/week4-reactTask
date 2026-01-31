function ProductList({products, openModal, initailTempProduct}) {
  const isStockEmpty = (stock) => stock == null || stock === "";
  return (
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
  )
}
export default ProductList