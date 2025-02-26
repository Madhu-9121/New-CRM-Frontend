import moment from 'moment'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import call from '../../service'
import { NewTable } from '../../utils/newTable'
import Filter from '../InvoiceDiscounting/components/Filter'
import Pagination from '../InvoiceDiscounting/contract/components/pagination'
import { AccordionTable } from '../wallet/components/accordionTable'
import FinanceInvoiceModal from '../InvoiceDiscounting/contract/components/financeinvoiceModal'
import { generateInvoiceNumber, printDiv } from '../../utils/myFunctions'

const TransactionsTab = ({ userTokenDetails }) => {
  const [filterData, setfilterdata] = useState([])
  const [filter, setFilter] = useState({ resultPerPage: 10 })
  const [refresh, setrefresh] = useState(0)
  const [Count, setCount] = useState(0)
  const [page, setpage] = useState(1)
  const [dbData, setdbData] = useState([])
  const [tableData, setTableData] = useState([])
  const [expandedData, setExapndedData] = useState([]);
  const [tableExpand, setTableExpand] = useState("");
  const [showLoader, setshowLoader] = useState(false)
  const [planBalance, setPlanBalance] = useState({})
  const [walletData, setWalletData] = useState({})
  const [lifetimSummary, setLifeTimeSummary] = useState({})
  const [showInvPdf, toggleInvPdf] = useState(false)
  const [invoicedata, setinvoicedata] = useState([])


  const userTypeId = userTokenDetails.type_id ? userTokenDetails.type_id : null
  const userEmail = userTokenDetails.email_id ? userTokenDetails.email_id : null
  const userId = userTokenDetails.id ? userTokenDetails.id : null
  const userName = userTokenDetails.company_name ? userTokenDetails.company_name : null
  const ttvExporterCode = userTokenDetails.ttvExporterCode ? userTokenDetails.ttvExporterCode : ''

  const getPlanBalance = () => {
    setshowLoader(true)
    call('POST', 'getPlanBalance', { userId }).then(result => {
      console.log('success in getPlanBalance', result)
      let expiryDate = moment(result.createdAt).add(result.plan_validity_unit?.toLowerCase(), result.plan_validity_value).format('MM/DD/YYYY')
      setPlanBalance({
        ...result,
        expiryDate: expiryDate
      })
      setshowLoader(false)
    }).catch(e => {
      console.log('error in getPlanBalance', e)
      setshowLoader(false)

    })
  }

  const getWalletBalance = () => {
    call('POST', 'getWalletBalance', { userId }).then((result) => {
      console.log("API result getWalletBalance", result);
      setshowLoader(false)
      if (result && result.length) {
        setWalletData(result[0])
      }
    }).catch((e) => {
      console.log("Error while getWalletBalance", e);
      setshowLoader(false)
    });
  }

  const getPlanTransactions = () => {
    setshowLoader(true)
    let reqObj = {
      userId,
      search: filter.search,
      resultPerPage: filter.resultPerPage,
      currentPage: page,
      fromDate: filter.fromDate,
      toDate: filter.toDate,
    }
    call('POST', 'getSubscriptionHistory', reqObj).then(result => {
      setTableData(formatDataForTable(result.message))
      setdbData(result.message)
      setCount(result.countdata.total_transactions)
      setshowLoader(false)
    }).catch(e => {
      console.log("Error while getSubscriptionHistory", e);
      setshowLoader(false)
    })
  }

  const getPlansLifetimeSummary = () => {
    call('POST', 'getPlansLifetimeSummary', { userId }).then(result => {
      setLifeTimeSummary(result)
    }).catch(e => {

    })
  }

  function formatDataForTable(data) {
    let tableData = []
    let row = []
    data.forEach((item, index) => {
      row[0] = <div>
        <img src={item.status === 1 ? "/assets/images/supplier-images/inProgress_icon.png" : item.status === 3 ? "/assets/images/supplier-images/failed_icon.png" : item.type === 'DEBIT' ? "/assets/images/supplier-images/debit_icon.png" : "/assets/images/supplier-images/credit_icon.png"} alt='' />
      </div>
      row[1] = item.createdByName
      row[2] = moment(item.updatedAt).format('DD/MM/YYYY hh:mm a')
      row[3] = item.serviceName
      row[4] = item.modeOfPayment
      row[5] = item.charges ? <>
        <span>{item.modeOfPayment === 'Coins' && <img src={'/assets/images/Lc/Dollar.png'} alt='' />}  {item.modeOfPayment === 'Coins' ? Math.abs(item.charges) : item.charges}</span>
      </> : <span>N/A</span>
      // row[6] = item.type
      row[6] = item.transactionId === tableExpand ? <div className='row' >
        <p onClick={() => expandedTableFN()} className="text-color1 font-wt-600 cursor">
          View Less
        </p>
      </div > : <div className='row' >
        <p onClick={() => expandedTable([item], item.transactionId)} className="text-color1 font-wt-600 cursor">
          View More
        </p>
      </div >
      row[7] = item.transactionId
      tableData.push(row)
      row = []
    })
    return tableData
  }

  const expandedTableFN = () => {
    setTableExpand("");
    setExapndedData([]);

  }

  const expandedTable = (more, buyer) => {
    setTableExpand(buyer);
    setExapndedData(more);
  }

  useEffect(() => {
    setTableData(formatDataForTable(dbData))
  }, [expandedData, tableExpand])

  useEffect(() => {
    getPlanTransactions()
  }, [page, refresh])

  useEffect(() => {
    getWalletBalance()
    getPlanBalance()
    getPlansLifetimeSummary()
  }, [])
  return (
    <>
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      {showInvPdf ? (
        <FinanceInvoiceModal modalSize={'xl'} limitinvoice={showInvPdf} closeSuccess={() => {
          toggleInvPdf(false)
        }}>
          <>
            <>
              <div id={"printsubscriptionInvoice"} className='px-4'>
                <div className='d-flex flex-row justify-content-end mb-3'>
                  <button type="button"
                    onClick={() => printDiv("printsubscriptionInvoice", `Subscription_Purchase_${invoicedata.createdByName}`, [])}
                    className={` border-0 mb-2 text-white enableQuotebtn`}>
                    {"Print Invoice"}
                  </button>
                </div>
                <div className='d-flex flex-row justify-content-between'>
                  <div>
                    <img width={"100px"} height={"55px"} src={"assets/images/logo_1.png"} />
                  </div>
                  <div>
                    <div className='d-flex flex-row'>
                      <div><img width={"20px"} height={"20px"} src={"assets/images/call-vector.png"} /></div>
                      <label className='text-color-value font-size-14 font-wt-600 text-center pl-2'>+ 91 84509 69138</label>
                    </div>
                    <div className='d-flex flex-row'>
                      <div><img width={"20px"} height={"20px"} src={"assets/images/mail-vector.png"} /></div>
                      <label className='text-color-value font-size-14 font-wt-600 text-center pl-2'>info@tradereboot.com</label>
                    </div>
                    <div className='d-flex flex-row'>
                      <div><img width={"20px"} height={"20px"} src={"assets/images/web-vector.png"} /></div>
                      <label className='text-color-value font-size-14 font-wt-600 text-center pl-2'>www.tradereboot.com</label>
                    </div>
                  </div>
                </div>
                <hr />
                <label className='text-color-value font-size-18 font-wt-600 text-center'>Invoice</label>
                <div className='d-flex flex-row justify-content-between'>
                  <div>
                    <div>
                      <label className='text-color-value font-size-14 font-wt-600 w-100 text-left'>Order From</label>
                      <label className='text-color-value font-size-13 font-wt-600 w-100 text-left'>{"TRADEREBOOT FINTECH PRIVATE LIMITED"}</label>
                      <div className='w-40'>
                        <label className='text-color-value font-size-13 font-wt-500 w-100 text-left'>{"511/512, Atlanta Estate, Western Express Hwy, opp. Westin Hotel, ITT Bhatti, Hanuman Tekdi, Goregaon, Mumbai, Maharashtra 400063"}</label>
                      </div>
                      <label className='text-color-value font-size-13 font-wt-500 w-100 text-left'>{`GST Number : 27AAFCI3158R1ZX`}</label>

                    </div>
                    <div className='mt-2'>
                      <label className='text-color-value font-size-14 font-wt-600 w-100 text-left'>To</label>
                      <label className='text-color-value font-size-13 font-wt-600 w-100 text-left'>{invoicedata.createdByName}</label>
                      <div className='w-40'>
                        <label className='text-color-value font-size-13 font-wt-500 w-100 text-left'>{invoicedata.createdByAddress}</label>
                      </div>
                      <label className='text-color-value font-size-13 font-wt-500 w-100 text-left'>{`GST Number : ${invoicedata.userGSTNo}`}</label>
                      {(invoicedata.userPan && invoicedata.userPan !== "null") && <label className='text-color-value font-size-13 font-wt-500 w-100 text-left'>{`PAN Number : ${invoicedata.userPan}`}</label>}
                    </div>
                  </div>
                  <div>
                    <p className='text-color-value font-size-12 font-wt-600 text-left'>{`Invoice Number: ${generateInvoiceNumber(invoicedata.createdAt, invoicedata.createdByName)}`}</p>
                    <p className='text-color-value font-size-12 font-wt-600 text-left'>{`Date: ${moment(invoicedata.createdAt).format('DD-MM-YYYY hh:mm A')}`}</p>
                  </div>
                </div>
                <label className='text-color-value font-size-14 font-wt-600 text-center my-4'>{`Purchase of ${invoicedata.serviceName}`}</label>
                <div>
                  <NewTable
                    disableAction={true}
                    data={[[moment(invoicedata.createdAt).format('DD-MM-YYYY hh:mm A'), "Subscription Plan", invoicedata.serviceName?.split('-')[0], invoicedata.serviceName?.split('-')[1], invoicedata.charges]]}
                    columns={[{ name: "Date" }, { name: "Product Category" }, { name: "Product Type" }, { name: "Product Sub Type" }, { name: "Charges" }]} />
                  <div className='d-flex flex-row justify-content-end'>
                    <table className='border'>
                      <tbody className='border'>
                        {invoicedata.modeOfPayment === 'FREE' ?
                          <tr className='border'>
                            <th scope="row" className='font-size-14 font-wt-600'>Total Discount</th>
                            <td className='font-size-14 font-wt-600'>{`${(invoicedata.charges)}`}</td>
                          </tr>
                          : null}
                        <tr className='border'>
                          <th scope="row" className='font-size-14 font-wt-600'>Total Charges</th>
                          <td className='font-size-14 font-wt-600'>{`${invoicedata.modeOfPayment === 'FREE' ? "$ 0" : invoicedata.charges}`}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className='d-flex flex-row '>
                    <table className='border w-100 mt-5'>
                      <tbody className='border'>
                        <tr className='border'>
                          <td className='font-size-14 font-wt-600 border'>
                            <th scope="row" className='font-size-14 font-wt-600 text-left' >Payment Transaction ID</th>
                            <tr className='font-size-14 font-wt-600 text-left'>{`${(invoicedata.transactionId)}`}</tr>
                          </td>

                          <td className='font-size-14 font-wt-600 border'>
                            <th scope="row" className='font-size-14 font-wt-600 text-left'>Date & Time</th>
                            <tr className='font-size-14 font-wt-500 text-left'>{`${moment(invoicedata.createdAt).format('DD-MM-YYYY hh:mm A')}`}</tr>
                          </td>

                          <td className='font-size-14 font-wt-600 border'>
                            <th scope="row" className='font-size-14 font-wt-600 text-left'>Invoice Value</th>
                            <tr className='font-size-14 font-wt-500 text-left'>{`${(invoicedata.charges)}`}</tr>
                          </td>

                          <td className='font-size-14 font-wt-600 border'>
                            <th scope="row" className='font-size-14 font-wt-600 text-left'>Mode of Payment</th>
                            <tr className='font-size-14 font-wt-500 text-left'>{`${(invoicedata.modeOfPayment)}`}</tr>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className='my-5'>
                <hr />
              </div>
            </>
          </>
        </FinanceInvoiceModal>
      ) : null}
      <div className='row'>
        <div className='card p-4 mt-4 borderRadius StandardCard col-md-4 ' >
          <a className='font-size-16 text-color1 text-decoration-none font-wt-600' href="/plans">{planBalance.plan_name + " - " + planBalance.plan_type}</a>
          <div className="col d-flex flex-row align-items-end px-0 mt-2">
            <div className="col">
              <div className="text-center">
                <label className='font-size-26 lh-35 text-color1 text-decoration-none font-wt-600 mb-0'>{planBalance.lc_nos}</label>
              </div>
              <div className="text-center">
                <label className="font-size-14 lineheight19 letter-spacing05 font-wt-500 text-center mb-0">LC</label>
              </div>
            </div>
            <div className="col">
              <div className="text-center">
                <label className='font-size-26 lh-35 text-color1 text-decoration-none font-wt-600 mb-0'>{planBalance.invoice_nos}</label>
              </div>
              <div className="text-center">
                <label className="font-size-16 font-wt-500 text-center mb-0">Invoice</label>
              </div>
            </div>
            <div className="col">
              <div className="text-center">
                <label className='font-size-26 lh-35 text-color1 text-decoration-none font-wt-600 mb-0'>{Intl.NumberFormat("en", { notation: 'compact' }).format(walletData.coins) || 0}</label>
              </div>
              <div className="text-center">
                <span className="font-size-16 font-wt-500 text-center mb-0"><img src={'/assets/images/Lc/Dollar.png'} alt='' />Coins</span>
              </div>
            </div>
          </div>
        </div>

        <div className='col-md-6 card border-0 chatlist p-4 mt-4 h-100 ml-4 borderRadius'>
          <p className='font-size-16  text-decoration-none font-wt-600' href="/plans">Lifetime plan summary</p>
          <div className="col d-flex flex-row align-items-end px-0 mt-2">
            <div className="col">
              <div className="text-center">
                <label className='font-size-26 lh-35 text-color1 text-decoration-none font-wt-600 mb-0'>{lifetimSummary.total_purchase_count || 0}</label>
              </div>
              <div className="text-center">
                <label className="font-size-14 lineheight19 letter-spacing05 font-wt-500 text-center mb-0">No of purchase</label>
              </div>
            </div>
            <div className="col">
              <div className="text-center">
                <label className='font-size-26 lh-35 text-color1 text-decoration-none font-wt-600 mb-0'>{"$ " + Intl.NumberFormat("en", { notation: 'compact' }).format(lifetimSummary.total_amount_spent) || 0}</label>
              </div>
              <div className="text-center">
                <label className="font-size-16 font-wt-500 text-center mb-0">Amount</label>
              </div>
            </div>
            <div className="col">
              <div className="text-center">
                <label className='font-size-26 lh-35 text-color1 text-decoration-none font-wt-600 mb-0'>{"$ " + Intl.NumberFormat("en", { notation: 'compact' }).format(lifetimSummary.total_coins_added) || 0}</label>
              </div>
              <div className="text-center">
                <span className="font-size-16 font-wt-500 text-center mb-0"><img src={'/assets/images/Lc/Dollar.png'} alt='' />Coins</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className='my-2'>
        <div className='filter-div ml-4'>
          <Filter
            filterData={filterData} setFilterData={setFilter} showFilterBtn={true}
            showResultPerPage={true} count={Count} filter={filter} setFilter={setFilter} refresh={refresh} setRefresh={setrefresh} isAdditionalButton={true} />
        </div>
        <div>
          <AccordionTable disableAction={false}
            columns={[{ name: "", filter: false, width: '4%' },
            { name: "Name", filter: true, width: '16%' },
            { name: "Date", filter: true, width: '16%' },
            { name: "Purpose", filter: true, width: '16%' },
            { name: "Mode of Payment", filter: true, width: '16%' },
            { name: "Amount", filter: true, width: '16%' },
            // { name: "Type", filter: true },
            { name: "", filter: false, width: '16%' }
            ]}
            data={tableData} overalldata={dbData}
            expand={expandedData} tableExpand={tableExpand} toggleInvPdf={toggleInvPdf} setInvoicedata={setinvoicedata} />
          <Pagination page={page} totalCount={Count} onPageChange={(p) => setpage(p)} refresh={refresh} setRefresh={setrefresh} perPage={filter.resultPerPage || 10} />

        </div>
      </div>
    </>
  )
}

export default TransactionsTab