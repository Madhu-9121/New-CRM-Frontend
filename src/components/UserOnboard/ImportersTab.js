import React, { useEffect, useState } from 'react'
import call from '../../service'
import { NewTable } from '../../utils/newTable'
import Filter from '../InvoiceDiscounting/components/Filter'
import Pagination from '../InvoiceDiscounting/contract/components/pagination'

const ImportersTab = ({ userTokenDetails }) => {
  const [summarydata, setSummarydata] = useState({})
  const [filterData, setFilterData] = useState([])
  const [refresh, setRefresh] = useState([])
  const [filter, setFilter] = useState({ resultPerPage: 10, search: '' })
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [showLoader, setShowLoader] = useState(false)
  const [dbData, setDbData] = useState([])
  const type_id = userTokenDetails?.type_id
  const getexportersummaryAdmin = () => {
    setShowLoader(true)
    call('POST', 'getexportersummaryAdmin', { type_id: 30 }).then(result => {
      setSummarydata(result)
      setShowLoader(false)
    }).catch(e => {
      setShowLoader(false)
    })
  }
  const getExportersListForAdmin = () => {
    setShowLoader(true)
    let reqObj = {
      resultPerPage: filter.resultPerPage,
      currentPage: page,
      search: filter.search,
      type_id: 30
    }
    call('POST', 'getExportersListForAdmin', reqObj).then(result => {
      setDbData(formatDataForTable(result.message))
      setCount(result.total_count)
      setShowLoader(false)
    }).catch(e => {
      setShowLoader(false)
    })
  }
  useEffect(() => {
    getexportersummaryAdmin()
  }, [])
  useEffect(() => {
    getExportersListForAdmin()
  }, [page, refresh])
  function formatDataForTable(data) {
    let tableData = []
    let row = []
    data.forEach((item, index) => {
      row[0] = item.company_name
      row[1] = `${item.name_title ? item.name_title : ''} ${item.contact_person ? item.contact_person : ''}`
      row[2] = `${item.phone_code ? "+" + item.phone_code : ''} ${item.contact_number ? item.contact_number : ''}`

      row[3] = item.company_country
      row[4] = 'LC'
      row[5] = 'Approved'
      row[6] = <img src='/assets/images/redirect.svg' />
      tableData.push(row)
      row = []
    })
    return tableData
  }
  return (
    <>
      <div className="row justify-content-between mt-4">
        {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
        <div className="col-md-3 ">
          <div className="card p-3 dashboard-card border-0 borderRadius h-100 justify-content-center me-3">
            <p className='dasboard-count text-color1 mb-1 font-size-22'>{summarydata.total_exporters ? summarydata.total_exporters : 0}</p>
            <label className='dashboard-name cursor font-size-16 font-wt-600'> <img className='me-2' src={"assets/images/Receivable.png"} alt="" /> Importers  </label>
          </div>
        </div>
        <div className="col-md-3 ">
          <div className="card p-3 dashboard-card border-0 borderRadius justify-content-center h-100  me-3">
            <label className='dasboard-count mb-1 font-size-14 font-wt-500'>Status</label>
            <div className='d-flex flex-row justify-content-around'>
              <div className='d-flex flex-column'>
                <label className='font-size-22 text-color1 font-wt-600'>{summarydata.active_exporters ? summarydata.active_exporters : 0}</label>
                <label className='font-size-16 font-wt-600'>Active</label>
              </div>
              <div className='d-flex flex-column'>
                <label className='font-size-22 font-wt-600 colorFF7B6D'>{summarydata.inactive_exporters ? summarydata.inactive_exporters : 0}</label>
                <label className='font-size-16 font-wt-600'>InActive</label>
              </div>
            </div>

          </div>
        </div>
        <div className="col-md-6 ">
          <div className="card p-3 dashboard-card border-0 borderRadius justify-content-center h-100 mx-0">
            <label className="text-secondary font-size-12 font-wt-500 mb-0">Ongoing applications</label>
            <div className="d-flex justify-content-between mt-1">
              <div>
                <p className='dasboard-count text-color1 font-size-22 mb-1 font-wt-600'>{summarydata.total_limit_count ? summarydata.total_limit_count : 0}</p>
                <label className='dashboard-name cursor font-wt-600'> Limit Application </label>
              </div>
              <div>
                <p className='dasboard-count text-color1 font-size-22 mb-1 font-wt-600'>{summarydata.total_finance_count ? summarydata.total_finance_count : 0}</p>
                <label className='dashboard-name cursor font-wt-600'> Finance Application </label>
              </div>
              <div>
                <p className='dasboard-count colorFF7B6D font-size-22 mb-1 font-wt-600'>{summarydata.total_rejected_count ? summarydata.total_rejected_count : 0}</p>
                <label className='dashboard-name cursor font-wt-600'> Rejected Application </label>
              </div>
            </div>
          </div>
        </div>
        <div className='my-4'>
          <div className='filter-div ml-4 '>
            <Filter
              filterData={filterData} setFilterData={setFilterData} showFilterBtn={true}
              showResultPerPage={true} count={count} filter={filter} setFilter={setFilter} refresh={refresh} setRefresh={setRefresh} showDownloadIcon onDownloadClick={() => { }} isAdditionalButton={true} >

              <div className="d-flex gap-4">
                <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={() => { }}>Add New User</button>
              </div>
            </Filter>
          </div>
          <div>
            <NewTable
              disableAction={true}
              columns={[{ name: "Company" }, { name: "Contract person" },
              { name: "Contact no." }, { name: "Country" }, , { name: "Type" }, { name: "Status" }, { name: "" }]}
              data={dbData} />
            <Pagination page={page} totalCount={count} onPageChange={(p) => setPage(p)} refresh={refresh} setRefresh={setRefresh} perPage={filter.resultPerPage || 10} />

          </div>
        </div>
      </div>
    </>
  )
}

export default ImportersTab