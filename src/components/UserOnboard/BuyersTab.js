import React, { useState } from 'react'
import { useEffect } from 'react'
import call from '../../service'
import MultipleSelect from '../../utils/MultipleSelect'
import { ClearCache, GetCache, getDocDetails, most_used_currencies, SetCache } from '../../utils/myFunctions'
import { InputWithSelect, NewInput, NewSelect } from '../../utils/newInput'
import { NewTable } from '../../utils/newTable'
import toastDisplay from '../../utils/toastNotification'
import Filter from '../InvoiceDiscounting/components/Filter'
import Pagination from '../InvoiceDiscounting/contract/components/pagination'
import config from '../../config.json';
import PieChartComponent from '../Reports/components/PieChartComponent'
import moment from 'moment'
import ViewBuyerDetails from '../myCounterPartComp/viewBuyerDetails'
import { ToastContainer } from 'react-toastify'
import { FormProgressBar } from '../CommonComponent/FormProgressBar'

const reviewForm = [
  { "name": "Buyer Name", val: "buyerName" },
  { "name": "Previous year annual sales", val: "buyerPrevSale", unit: "buyerCurrency" },
  { "name": "Contact Number:", val: "buyerContact", unit: "buyerPhoneCode" },
  { "name": "Expected current year’s annual sale", val: "buyerExpectedSale", unit: "buyerCurrency" },

  { "name": "Email Id", val: "buyerEmail" },
  { "name": "Inco Terms", val: "buyerIncoTerms" },
  { "name": "Website", val: "buyerWebsite" },
  { "name": "Terms of Payment", val: "buyerTermsPayment" },

  { "name": "Address", val: "buyerAddress" },
  { "name": "Product Details", val: "buyerProductDetails" },

  { "name": "Country", val: "buyerCountry" },
  { "name": "Postal Code", val: "buyerPostalCode" },
  { "name": "DUNS No", val: "buyerDunsNo" },
  { "name": "HSN Code", val: "buyerHsnCode" },
]

// const financierData = [
//   { id: 100, name: "Stenn", icon: "stenn.png", rating: 4.6, reviews: 126 },
//   { id: 200, name: "Modifi", icon: "modifi.png", rating: 1, reviews: 130 },
// ]

export const IncoTerms = [
  { name: "EXW" },
  { name: "FCA" },
  { name: "FAS" },
  { name: "FOB" },
  { name: "CFR" },
  { name: "CIF" },
  { name: "CPT" },
  { name: "CIP" },
  { name: "DAP" },
  { name: "DPU" },
  { name: "DDP" }
]

const addBuyerTabs = [
  { name: "Select Buyer" },
  { name: "DUNS No." },
  { name: "Buyer details" },
  { name: "Review" }
]


const invoiceLcStatusColor = ['#48DA87', '#FF7B6D', '#FFAC1C']

const invoiceLcStatus = [
  { label: "Approved", color: '#48DA87' },
  { label: "Rejected", color: "#FF7B6D" },
  { label: "Inprocess", value: "#FFAC1C" }

]

const BuyersTab = ({ userTokenDetails }) => {

  const queryParams = new URLSearchParams(window.location.search)
  const editBuyer = queryParams.get("editBuyer")
  let serarchParam = queryParams.get('search')
  const buyerAction = queryParams.get("action")
  let cache_data = GetCache("add_buyer_form_data");

  let todayDateObj = moment()
  let lastMonthDateObj = moment().subtract("1", "months")

  const [showAddBuyerForm, toggleAddBuyerForm] = useState(buyerAction === 'addNewBuyer')
  const [filterData, setfilterdata] = useState([])
  const [filter, setFilter] = useState({ resultPerPage: 10 })
  const [refresh, setrefresh] = useState(0)
  const [Count, setCount] = useState(0)
  const [page, setpage] = useState(1)
  const [dbData, setdbData] = useState([])
  const [showLoader, setshowLoader] = useState(false)
  const [tab, setTab] = useState(0)
  const [data, setData] = useState(
    cache_data["data"] ||
    { selectedFinanciers: [], buyerNameTitle: "Mr", buyerPhoneCode: "91", buyerCurrency: "USD" })
  const [errors, setErrors] = useState({})
  const [dunsData, setDunsData] = useState([])
  const [hsnCodes, setHsnCodes] = useState([])
  const [countrys, setCountrys] = useState([])
  const [currencyData, setcurrencyData] = useState(most_used_currencies);
  const [annualTurnover, setAnnualTurnover] = useState('Less than 250 Cr')
  const [lcTutorial, toggleLCTutorial] = useState(localStorage.getItem("lcTutorialStep") == 2)
  const [tutorialStage, setTutorialStage] = useState(0)
  const [showTutorialVideo, toggleTutorialVideo] = useState({ show: false, link: null })
  const [newBuyerId, setnewBuyerId] = useState('')
  const [showMsgPopup, toggleMsgPopup] = useState(false)
  const [addBuyer, setAddBuyer] = useState(false)
  const [stats, setStats] = useState({
    buyserStats: {}
  })
  const [graphConfiguration, setGraphConfiguration] = useState({
    invoiceLcApplicationFrom: lastMonthDateObj.clone().format("YYYY-MM-DD"),
    invoiceLcApplicationTo: todayDateObj.clone().format("YYYY-MM-DD")
  })
  const [checkBuyerHealth, setCheckBuyerHealth] = useState({ show: false, data: {} })
  const [viewBuyerDetails, setViewBuyerDetails] = useState({ show: false, data: {} })
  const [overalldata, setoveralldata] = useState([])
  const [filteredSearch, setFilteredSearch] = useState([])

  const subUserName = "Admin"
  const mainUserName = userTokenDetails?.company_name


  const userTypeId = userTokenDetails.type_id ? userTokenDetails.type_id : null
  const userEmail = userTokenDetails.email_id ? userTokenDetails.email_id : null
  const userId = userTokenDetails.id ? userTokenDetails.id : null
  const userName = userTokenDetails.company_name ? userTokenDetails.company_name : null
  const ttvExporterCode = userTokenDetails.ttvExporterCode ? userTokenDetails.ttvExporterCode : ''

  const handleMultiSelectchange = (e, name, val) => {
    setData({
      ...data,
      [name]: Array.isArray(e) ? e.map((x) => x[val]) : []
    });
  };

  async function handleValidation(tabIndex) {

    if (tabIndex != undefined) {
      if (tabIndex < tab) {
        return setTab(tabIndex)
      }
      else if (tabIndex == tab) {
        return null
      }
      else {
        return toastDisplay("Click on continue button to go to next form", "info")
      }
    }

    let validateFields = []
    let err = {}
    if (tab === 0) {
      validateFields = ["buyerName", "buyerCountry"]
    }

    if (tab === 2) {
      validateFields = ["buyerName", "buyerCountry", "buyerAddress", "buyerPostalCode",
        "buyerPrevSale", "buyerExpectedSale", "buyerIncoTerms", "buyerTermsPayment", "buyerProductDetails"]
    }

    // if (tab === 3) {
    //   validateFields = []
    // }

    // if (tab === 4) {
    //   if (!data.selectedFinanciers.length) {
    //     return toastDisplay("Select atleast 1 financier", "info")
    //   }
    // }

    validateFields.forEach((item) => {
      if (!data[item]) {
        err[item] = "Mandatory Field"
      }
    })

    if (!Object.keys(err).length) {
      let redirectBackTo = localStorage.getItem("redirectBackTo")
      if (redirectBackTo && tab == 2) {
        submitBuyerDetails()
        return null
      }
      if (tab != 3) {
        if (tab === 0) {
          return getDunsList()
        }
        setTab(tab + 1)
      }
      else {
        submitBuyerDetails()
      }
    }
    setErrors(err)
  }
  useEffect(() => {
    getBuyerDetails()
  }, [refresh, page, filterData])
  useEffect(() => {
    call('POST', 'getBuyerListFilters', { userId }).then(res => {
      console.log("getBuyerListFilters then", res);
      let temp = res
      delete temp["Shipment"]
      setfilterdata(temp)
      setFilteredSearch(temp)
    }).catch(err => { })

  }, [])
  useEffect(() => {
    setshowLoader(true)
    call('POST', 'getLCINVGraphdata', { ...graphConfiguration, userId }).then(result => {
      setStats(result)
      setshowLoader(false)
    }).catch(e => {
      setshowLoader(false)

    })
  }, [graphConfiguration])
  const getBuyerDetails = () => {
    let objectAPI = {
      "userId": userId,
      "userEmail": userEmail,
      "userTypeId": userTypeId,
      "type": 'all',
      currentPage: page,
      // exactMatchId: editBuyer || undefined,
      ...filter,
      ttvExporterCode: ttvExporterCode
    }
    setshowLoader(true)
    for (let index = 0; index < Object.keys(filterData || {}).length; index++) {
      let filterName = Object.keys(filterData)[index]
      const element = filterData[filterName];
      if (element.isFilterActive) {
        if (element.type === "checkbox") {
          objectAPI[element.accordianId] = []
          element["data"].forEach((i) => {
            if (i.isChecked) {
              objectAPI[element.accordianId].push(element.accordianId === "hsCodes" ? i[element["labelName"]] : `'${i[element["labelName"]]}'`)
            }
          })
        }
        else if (element.type === "minMax") {
          objectAPI[element.accordianId] = element["value"]
        }
      }
    }
    call('POST', 'getBuyerDetailsV2', objectAPI).then((result) => {
      setshowLoader(false)
      console.log('running getBuyersDetail api-->', result, formatDataForTable(result.buyerData));
      setdbData(formatDataForTable(result.buyerData))
      setoveralldata(result.buyerData)
      setCount(result.countData);
    }).catch((e) => {
      // console.log('error in getBuyersDetail', e);
      setshowLoader(false)
    });
  }
  const handleChange = async (event) => {
    event.persist()
    setData({ ...data, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: "" })
  }
  function formatDataForTable(data) {
    let tableData = []
    let row = []
    data.forEach((item, index) => {
      let hsnCodes = item.buyerHsnCode ? item.buyerHsnCode.split(",") : []
      row[0] = item.buyerName
      row[1] = item.buyerDUNSNo || 'NA'
      row[2] = item.countryName
      row[3] = item.invoiceLimitAvailable ? item.invoiceLimitAvailable : 'NA'
      row[4] = item.annualTurnOver

      tableData.push(row)
      row = []
    })
    return tableData
  }
  const getHSNCodes = () => {
    call('get', 'getHsnCodes').then((result) => {
      setHsnCodes(result)
    }).catch((e) => {
      console.log('error in getHsnCodes', e);
    })
  }
  async function submitBuyerDetails() {
    setshowLoader(true)
    let formData = new FormData();
    formData.append("buyerName", data.buyerName)
    formData.append("buyerCountry", data.buyerCountry)
    formData.append("buyerDUNSNo", data.buyerDunsNo)
    formData.append("buyerAddress", data.buyerAddress)
    formData.append("buyerPostalcode", data.buyerPostalCode)
    if (data.buyerWebsite) {
      formData.append("buyerWebsite", data.buyerWebsite)
    }
    if (data.buyerEmail) {
      formData.append("buyerEmail", data.buyerEmail)
    }
    if (data.buyerContact) {
      formData.append("buyerContact", data.buyerContact)
    }
    formData.append("annualSale", data.buyerPrevSale)
    formData.append("expectedAnnualSale", data.buyerExpectedSale)
    formData.append("annualTurnOver", annualTurnover)
    let buyerCurrency = most_used_currencies.filter(item => item.code === data.buyerCurrency)[0]
    formData.append("buyerCurrency", buyerCurrency["id"] + ":" + buyerCurrency["code"])
    formData.append("incoTerms", data.buyerIncoTerms)
    formData.append("payment", data.buyerTermsPayment)
    formData.append("productDetail", data.buyerProductDetails)
    formData.append("userId", userId)
    formData.append("userEmail", userEmail)
    formData.append("userName", userName)
    formData.append("baseUrl", config.baseUrl)
    formData.append("ActionBy", subUserName ? subUserName : mainUserName)
    if (!data.invoiceDocument?.noChange) {
      formData.append("previousInvoiceDocument", data.invoiceDocument)
    }
    if (!data.poDocument?.noChange) {
      formData.append("previousPODocument", data.poDocument)
    }
    //Additional fields
    formData.append("buyerHsnCode", data.buyerHsnCode && data.buyerHsnCode.length ? data.buyerHsnCode.join(",") : "")
    formData.append("buyerNameTitle", data.buyerNameTitle)
    formData.append("buyerPhoneCode", data.buyerPhoneCode)
    if (Object.keys(data.buyersAPIDetail || {}).length) {
      formData.append("buyersAPIDetail", JSON.stringify(data.buyersAPIDetail))
    }
    if (data.invoiceDocument?.signatureId) {
      formData.append("invoiceDocSignId", data.invoiceDocument.signatureId)
    }
    if (data.poDocument?.signatureId) {
      formData.append("poDocSignId", data.poDocument.signatureId)
    }
    if (data.isEditing) {
      formData.append("buyerId", data.buyerId)
      formData.append("buyersDocId", data.buyersDocId)
    }
    call('POST', `${data.isEditing ? "updateBuyersDetails" : "insertBuyersDetail"}`, formData).then((result) => {
      if (buyerAction === 'addNewBuyer') {
        window.close()
      }
      setnewBuyerId(result.buyer_id)
      setshowLoader(false)
      toggleMsgPopup(true)
      ClearCache("add_buyer_form_data");
      setAddBuyer(false)
      toggleAddBuyerForm(false)
      getBuyerDetails()
      if (lcTutorial) {
        toggleLCTutorial(false)
        localStorage.setItem("lcTutorialStep", 7)
      }
    }).catch(err => {
      // console.log("insertBuyersDetail error:", err)
      setshowLoader(false)
      toastDisplay("Something went wrong", "error");
    })
  }
  function getDunsList() {
    setData({
      ...data, selectedDuns: null,
      buyerAddress: "",
      buyerPostalCode: "", buyerDunsNo: ""
    })
    setshowLoader(true)
    call('POST', 'getDUNSNo', {
      companyName: data.buyerName, countryCode: data.buyerCountry,
      userId, userEmail
    }).then((result) => {
      setshowLoader(false)
      if (result.length > 0) {
        setDunsData(result);
        setTab(1)
      }
      else {
        toastDisplay("No Related Buyer Details Found", "error")
        setTab(2)
        setDunsData([])
      }
    })
  }
  const getCountrydata = () => {
    call('GET', 'getallCountry').then((result) => {
      console.log('running getallCountry api-->', result);
      setCountrys(result)
    }).catch((e) => {
      // console.log('error in getBuyersDetail', e);
    });
  }
  useEffect(() => {
    getCountrydata()
    getBuyerDetails()
    getHSNCodes()
  }, [])
  async function onView(index) {
    let selectedBuyer = overalldata[index]
    setshowLoader(true)
    let invoiceDocument = await getDocDetails(selectedBuyer.buyersDocId.split(":")[0])
    let poDocument = await getDocDetails(selectedBuyer.buyersDocId.split(":")[1])
    setshowLoader(false)
    setViewBuyerDetails({ show: true, data: { ...selectedBuyer, invoiceDocument, poDocument, index } })
  }

  const handleGraphConfigurationChange = async (event) => {
    if (event.persist) {
      event.persist()
    }
    setGraphConfiguration({ ...graphConfiguration, [event.target.name]: event.target.value })
  }
  const CustomTooltipForInvoiceLc = ({ payload, data }) => {
    let payloadIndex = payload?.[0]?.name
    let values = {
      0: { "label": "Approved", total: "approved", amount: 'approvedAmount', class: ' text-48DA87 ' },
      1: { "label": "Rejected", total: "rejected", amount: 'rejectedAmount', class: ' colorFF7B6D ' },
      2: { "label": "Inprogress", total: "pending", amount: 'pendingAmount', class: ' text-F1C40F ' }
    }
    return (
      <div
        className='bg-dark px-4 py-3'
        style={{
          borderRadius: 10
        }}>
        <p className={`font-wt-600 font-size-14 m-0 p-0 ${values?.[payloadIndex]?.["class"]} `}>{`${values?.[payloadIndex]?.["label"]}`}</p>
        <p className={`font-wt-600 font-size-14 m-0 p-0 ${values?.[payloadIndex]?.["class"]} `}>{`Application - ${data?.[values?.[payloadIndex]?.["total"]]}`}</p>
        <p className={`font-wt-600 font-size-14 m-0 p-0 ${values?.[payloadIndex]?.["class"]} `}>{`Amount - $ ${Intl.NumberFormat("en", { notation: 'compact' }).format(data?.[values?.[payloadIndex]?.["amount"]])}`}</p>
      </div>
    );
  };
  async function downloadInvoiceLcApplicationData() {
    if (!stats?.tableDataForInvoiceLcApplication?.length) {
      return toastDisplay('No data found to download', "info")
    }
    try {
      let csvString = "Application Status,Approved Application,Approved Amount ($),Rejected Application,Rejected Amount ($),Inprocess Application,Inprocess Amount ($)\r\n"
      for (let index = 0; index < stats?.tableDataForInvoiceLcApplication.length; index++) {
        const element = stats?.tableDataForInvoiceLcApplication[index];
        let rowString = `${element[0]},
          ${element[1]},
          ${element[2]},
          ${element[3]},
          ${element[4]},
          ${element[5]},
          ${element[6]}\r\n`
        rowString = rowString.replace(/(\n)/gm, "")
        csvString += rowString
      }
      let link = document.createElement('a');
      link.style.display = 'none';
      link.setAttribute('target', '_blank');
      link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
      link.setAttribute('download', `InvoiceLCApplicationData.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log("error in downloadInvoiceLcApplicationData", error);
    }
  }
  function onCheckBuyerHealthClick(index) {
    const selectedBuyer = overalldata[index]
    setshowLoader(true)
    call('POST', 'getBuyerHealth', { duns: selectedBuyer.buyerDUNSNo }).then((result) => {
      setshowLoader(false)
      setCheckBuyerHealth({ show: true, data: result })
    }).catch((e) => {
      // console.log('error in getBuyersDetail', e);
      setshowLoader(false)
      //setaddbuyerhealth({ show: true, data: dbData[index] })
      toastDisplay(e, "error")
    });
  }
  async function onDelete(index) {
    setshowLoader(true)
    call('POST', 'deleteBuyerDetails', { finDtId: overalldata[index]["id"] }).then((result) => {
      toastDisplay(result, "success");
      setrefresh(refresh + 1)
      setshowLoader(false)
      setViewBuyerDetails({ show: false, data: {} })
    }).catch((e) => {
      // console.log('error in deleteBuyerDetails', e);
      toastDisplay(e, "error");
      setshowLoader(false)
    })
  }

  async function onEdit(index) {
    setViewBuyerDetails({ show: false, data: {} })
    toggleAddBuyerForm(true)
    setshowLoader(true)
    let selectedBuyer = overalldata[index]
    let invoiceDocument = await getDocDetails(selectedBuyer.buyersDocId.split(":")[0])
    let poDocument = await getDocDetails(selectedBuyer.buyersDocId.split(":")[1])
    setshowLoader(false)
    setData({
      buyerId: selectedBuyer.id,
      buyerName: selectedBuyer.buyerName,
      buyerCountry: selectedBuyer.buyerCountry,
      buyerEmail: selectedBuyer.buyerEmail,
      buyerContact: selectedBuyer.buyerPhone,
      buyerPhoneCode: selectedBuyer.buyerPhoneCode,
      buyerCurrency: selectedBuyer.buyerCurrency.split(":")[1],
      buyerWebsite: selectedBuyer.buyerWebsite,
      buyerPrevSale: selectedBuyer.previousAnnualSale,
      buyerExpectedSale: selectedBuyer.currentAnnualSale,
      buyerIncoTerms: selectedBuyer.incoTerms,
      buyerTermsPayment: selectedBuyer.termsOfPayment,
      buyerProductDetails: selectedBuyer.productDetails,
      buyerHsnCode: selectedBuyer.buyerHsnCode ? selectedBuyer.buyerHsnCode.split(",") : null,
      buyersDocId: selectedBuyer.buyersDocId,
      invoiceDocument: { ...invoiceDocument, noChange: true },
      poDocument: { ...poDocument, noChange: true },
      isEditing: true,
      tcAccepted: true
    })
  }
  const onGetLimit = (index) => {
    let selectedBuyer = overalldata[index]
    localStorage.setItem("UserDetails", JSON.stringify({
      ...userTokenDetails,
      user_id: userTokenDetails.id,
      email: userTokenDetails.email_id,
      userName
    }))
    window.open(`/applyForLimit?buyer=${selectedBuyer.id}`, "_blank")
  }
  useEffect(() => {
    if (!data.isEditing) {
      SetCache('add_buyer_form_data', {
        data: {
          ...data, invoiceDocument: null, poDocument: null, docToSign: {}
        }
      })
    }
  }, [data])
  return (
    <>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      <div className='row mt-4'>
        <div className='w-40'>
          <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
            <label className='w-100 font-size-14 text-color-value font-wt-600 pt-2'>{`Total Buyers - `}
              <label className='font-size-14 text-color-value font-wt-600 text-custom2'>{` ${Count || "NA"}`}</label></label>
            <div className='row px-0 w-100'>
              <div className='w-33'>
                <label className={`value font-wt-600 textFFB801 w-100`}>
                  {`${stats["buyserStats"]["limit_applied_count"] || "NA"}`}
                </label>
                <label className={'font-size-14 font-wt-600 text-color-value'}>{"Limit Applied"}</label>
              </div>
              <div className='w-33'>
                <label className={`value font-wt-600 text-48DA87  w-100`}>
                  {`${stats["buyserStats"]["limit_available_count"] || "NA"}`}
                </label>
                <label className={'font-size-14 font-wt-600 text-color-value'}>{"Limit Available"}</label>
              </div>

              <div className='w-33'>
                <label className={`value font-wt-600 colorFF7B6D w-100`}>
                  {`${stats["buyserStats"]["limit_not_applied_count"] || "NA"}`}
                </label>
                <label className={'font-size-14 font-wt-600 text-color-value'}>{"Limit Not Applied"}</label>
              </div>
            </div>
          </div>
        </div>

        <div className='w-17'>
          <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
            <label className={`value font-wt-600 text-custom2`}>
              {`$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(stats["buyserStats"]["limit_available"])}` || "NA"}
            </label>
            <label className={'font-size-14 font-wt-600 text-color-value'}>{"Limit Available"}</label>
          </div>
        </div>

        <div className='w-25'>
          <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
            <div className='row px-0 w-100'>
              <div className='w-50'>
                <label className={`value font-wt-600 .textFFB801  w-100`}>
                  {`$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(stats["buyserStats"]["finance_applied"])}` || "NA"}
                </label>
                <label className={'font-size-14 font-wt-600 text-color-value'}>{"Finance Applied"}</label>
              </div>

              <div className='w-50'>
                <label className={`value font-wt-600 text-48DA87 w-100`}>
                  {`$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(stats["buyserStats"]["finance_approved"])}` || "NA"}
                </label>
                <label className={'font-size-14 font-wt-600 text-color-value'}>{"Finance Approved"}</label>
              </div>
            </div>
          </div>
        </div>

        <div className='w-17'>
          <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
            <div className='row px-0 w-100'>
              <div>
                <label className={`value font-wt-600 text-custom2 w-100`}>
                  {`$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(stats["buyserStats"]["disbursement_done"])}` || "NA"}
                </label>
                <label className={'font-size-14 font-wt-600 text-color-value'}>{"Disbursement done"}</label>
              </div>

            </div>
          </div>
        </div>

      </div>
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      {(addBuyer || showAddBuyerForm) &&
        <div>
          <i
            onClick={() => {
              setAddBuyer(false)
            }}
            class="fas fa-2x fa-arrow-left mx-1 mb-4 icon-color cursor"></i>
          {/* <ul className="nav nav-tabs-custom align-items-end" id="myTab" role="tablist">
            {addBuyerTabs.map((item, index) => {
              return (
                <li>
                  <a className={"nav-link formTab pl-4 pr-4 cursor-pointer " + (tab === index ? " formActiveTab show" : "")} onClick={() => {
                    handleValidation(index)
                  }}>{item.name}</a>
                </li>
              )
            })}
          </ul> */}

          <div className='bg-white pb-5'
            style={(lcTutorial) ? {
              "background": "white",
              "position": "relative",
              "zIndex": 10001,
              "padding": "1rem 0rem 1rem 0rem",
              "borderRadius": "1rem",
              "height": "auto",
              "maxHeight": "40rem",
              "overflow": "auto"
            } : {
              "height": "40rem",
              "overflow": "auto"
            }}
          >

            <div className="d-flex justify-content-center mt-5 mb-3" >
              <FormProgressBar
                tabs={addBuyerTabs} activeTab={tab} label={"name"}
                separationWidth={'7rem'} handleClick={(i, index) => { handleValidation(index) }}
              />
            </div>

            {tab === 0 ? (
              <div className='px-4 py-5'>
                <div className="row">

                  <div className="col-md-4">
                    <NewInput isAstrix={true} type={"text"} label={"Buyer's Name"}
                      name={"buyerName"} value={data.buyerName} error={errors.buyerName}
                      onChange={handleChange} />
                  </div>

                  <div className="col-md-4">
                    <NewSelect isAstrix={true} label={"Select Country"}
                      selectData={countrys} name={"buyerCountry"}
                      value={data.buyerCountry} optionLabel={"name"} optionValue={'sortname'}
                      onChange={handleChange} error={errors.buyerCountry} />
                  </div>
                </div>
              </div>
            ) : null}

            {tab === 1 ? (
              <div className='px-4 py-5'>
                <label className='mb-4' >Select DUNS No.</label>
                <div className='row dunsCardView px-3'>
                  {dunsData.length ? dunsData.map((item, index) => {
                    return (
                      <div
                        onClick={() => {
                          setData({
                            ...data, selectedDuns: index,
                            buyerAddress: item.address.street,
                            buyerPostalCode: item.address.postalCode, buyerDunsNo: item.duns,
                            buyersAPIDetail: item
                          })
                        }}
                        className={`dunsCard cursor mb-5 mr-5 p-4 ${data.selectedDuns === index ? "selectedDunsCard" : ""} `}
                      >
                        <h6 className='text-color1'>{item.duns}</h6>
                        <label className='text-color-label' >Company name</label>
                        <br />
                        <label className='text-color-value'>{item.companyName}</label>
                        <br />
                        <label className='text-color-label'>Address</label>
                        <br />
                        <label className='text-color-value'>{`${item.address.street}, ${item.address.city}, ${item.address.countryCode}, ${item.address.postalCode}`}</label>
                      </div>
                    )
                  }) : (
                    <h6>No Related Buyer Details Found</h6>
                  )}
                </div>
              </div>
            ) : null}

            {tab === 2 ? (
              <div className='px-4 py-5'>
                <div className="row">
                  <div className="col-md-4">
                    <NewInput isAstrix={true} type={"text"} label={"Buyer's Name"}
                      name={"buyerName"} value={data.buyerName} error={errors.buyerName}
                      onChange={handleChange} />
                  </div>


                  <div className="col-md-4">
                    <NewSelect isAstrix={true} label={"Select Country"}
                      selectData={countrys} name={"buyerCountry"}
                      value={data.buyerCountry} optionLabel={"name"} optionValue={'sortname'}
                      onChange={handleChange} error={errors.buyerCountry} />
                  </div>

                  <div className="col-md-4">
                    <NewInput type={"text"} label={"Email Id"}
                      name={"buyerEmail"} value={data.buyerEmail}
                      onChange={handleChange} />
                  </div>

                  <div className="col-md-4">
                    <InputWithSelect type={"number"} label={"Contact Number"}
                      selectData={countrys}
                      selectName={"buyerPhoneCode"} selectValue={data.buyerPhoneCode}
                      optionLabel={"phonecode"} optionValue={'phonecode'}
                      name={'buyerContact'} value={data.buyerContact}
                      onChange={handleChange} />
                  </div>

                  <div className="col-md-4">
                    <NewInput isAstrix={true} type={"text"} label={"Address"}
                      name={"buyerAddress"} value={data.buyerAddress}
                      onChange={handleChange} error={errors.buyerAddress} />
                  </div>

                  <div className="col-md-4">
                    <NewInput isAstrix={true} type={"text"} label={"Postal Code"}
                      name={"buyerPostalCode"} value={data.buyerPostalCode}
                      onChange={handleChange} error={errors.buyerPostalCode} />
                  </div>

                  <div className="col-md-4">
                    <NewInput type={"text"} label={"Website"}
                      name={"buyerWebsite"} value={data.buyerWebsite}
                      onChange={handleChange} error={errors.buyerWebsite} />
                  </div>

                  <div className="col-md-4">
                    <NewInput isDisabled={data.selectedDuns != null} type={"text"} label={"DUNS No"}
                      name={"buyerDunsNo"} value={data.buyerDunsNo}
                      onChange={handleChange} error={errors.buyerDunsNo} />
                  </div>

                  <div className="col-md-4">
                    <InputWithSelect isAstrix={true} type={"number"} label={"Previous year annual sales"}
                      selectData={currencyData}
                      selectName={"buyerCurrency"} selectValue={data.buyerCurrency}
                      optionLabel={"code"} optionValue={'code'}
                      name={'buyerPrevSale'} value={data.buyerPrevSale} error={errors.buyerPrevSale}
                      onChange={handleChange} />
                  </div>

                  <div className="col-md-4">
                    <InputWithSelect isAstrix={true} type={"number"} label={"Expected current year’s annual sale"}
                      selectData={currencyData}
                      selectName={"buyerCurrency"} selectValue={data.buyerCurrency}
                      optionLabel={"code"} optionValue={'code'}
                      name={'buyerExpectedSale'} value={data.buyerExpectedSale} error={errors.buyerExpectedSale}
                      onChange={handleChange} />
                  </div>

                  <div className="col-md-4">
                    <NewSelect isAstrix={true} label={"Select Inco Terms"}
                      selectData={IncoTerms} name={"buyerIncoTerms"}
                      value={data.buyerIncoTerms} optionLabel={"name"} optionValue={'name'}
                      onChange={handleChange} error={errors.buyerIncoTerms} />
                  </div>

                  <div className="col-md-4">
                    <NewInput isAstrix={true} type={"text"} label={"Terms of Payment"}
                      name={"buyerTermsPayment"} value={data.buyerTermsPayment}
                      onChange={handleChange} error={errors.buyerTermsPayment} />
                  </div>

                  <div className="col-md-4">
                    <NewInput isAstrix={true} type={"text"} label={"Product Details"}
                      name={"buyerProductDetails"} value={data.buyerProductDetails}
                      onChange={handleChange} error={errors.buyerProductDetails} />
                  </div>

                  <div className="col-md-4">
                    <MultipleSelect
                      Id="HSN Code"
                      Label="HSN Code"
                      selectedvalue="HSN Code"
                      optiondata={hsnCodes}
                      onChange={(e) => handleMultiSelectchange(e, "buyerHsnCode", "code")}
                      value={data.buyerHsnCode || []}
                      name="buyerHsnCode"
                      labelKey={"code"}
                      valKey={"code"}
                    />
                  </div>
                </div>
                <div className='d-flex flex-row align-items-center'>
                  <div className='d-flex flex-row px-2'>
                    <label className="form-check-label mt-1 font-size-15 font-wt-500" >
                      Buyer Annual Turnover
                    </label>
                  </div>
                  <div className='d-flex flex-row px-2' onClick={() => setAnnualTurnover('Less than 250 Cr')}>
                    <input className="form-check-input" type="radio" value={"Less than 250 Cr"} checked={annualTurnover === 'Less than 250 Cr'} />
                    <label className="form-check-label p-0 m-0" >
                      Less than 250 Cr
                    </label>
                  </div>
                  <div className='d-flex flex-row px-2' onClick={() => setAnnualTurnover('More than 250 Cr')}>
                    <input className="form-check-input" type="radio" value={"More than 250 Cr"} checked={annualTurnover === 'More than 250 Cr'} />
                    <label className="form-check-label p-0 m-0" >
                      More than 250 Cr
                    </label>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === 3 ? (
              <div className='p-5'>
                <div className="row">

                  <div className='w-100'>
                    <label className='font-wt-500 font-size-16'><u>Buyer Details</u></label>
                    <div className='row'>
                      {reviewForm.map((item) => {
                        return (
                          // <div className='col-5 p-0'>
                          //   <label className='col-6 lh-18 text-color-label font-size-14'>{item.name}</label>
                          //   <label className='lh-18 font-size-14'>:</label>
                          //   <label className='col-5 lh-18 pl-4 font-wt-600 text-color-value font-size-14'>
                          //     {data[item.val] ? (item.unit ? `${data[item.unit]} ` : "") + (data[item.val]) : "NA"}
                          //   </label>
                          // </div>
                          <div className="col-md-6 pe-5">
                            <p className="d-flex d-flex align-items-top mb-2"><span className="col-md-5 px-0 BuyerdetailsLabel">{item.name}</span><span className="mx-3">:</span><span className="col-md-7 BuyerdetailsDesc" > {data[item.val] ? (item.unit ? `${data[item.unit]} ` : "") + (data[item.val]) : "NA"}</span> </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {data.isEditing ? null : (
                    <div className='mt-3'>
                      <img
                        onClick={() => setData({ ...data, tcAccepted: !data.tcAccepted })}
                        className='cursor mr-3' src={`assets/images/${data.tcAccepted ? 'checked-green' : 'empty-check'}.png`} />
                      <label>I hereby declare that the above given information by me is true to my knowledge.</label>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {tab === 3 && !data.tcAccepted ? null : (
              <div className={tab === 1 ? "buyerContinuBtn row" : "row mx-0 px-3"} style={tab === 1 ? { top: "40%" } : {}}>
                <button type="button"
                  onClick={() => {
                    handleValidation(undefined)
                  }}
                  className={`mx-2 new-btn ${tab === 1 ? '' : 'w-25'} py-2 px-2 text-white`}>
                  {tab === 3 ? `${data.isEditing ? 'Update Buyer' : 'Add Buyer'}` : "Continue"}
                </button>
              </div>
            )}
          </div>
        </div>
      }
      {!addBuyer && !showAddBuyerForm &&
        <>
          <div className='card border-0 chatlist p-4 '>
            {viewBuyerDetails.show ?
              <ViewBuyerDetails data={viewBuyerDetails.data} userTokenDetails={{ ...userTokenDetails, user_id: userTokenDetails.id }} onEdit={onEdit} onDelete={onDelete} goback={() => {
                setViewBuyerDetails({ show: false, data: {} })
              }} />
              : <div className='my-2'>
                <div className='filter-div ml-4'>
                  <Filter
                    filteredSearch={filteredSearch}
                    setFilteredSearch={setFilteredSearch}
                    filterData={filterData} setFilterData={setfilterdata} showFilterBtn={true}
                    showResultPerPage={true} count={Count} filter={filter} setFilter={setFilter} refresh={refresh} setRefresh={setrefresh} isAdditionalButton={true}>
                    <div className="d-flex gap-4">
                      <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={() => { setAddBuyer(true) }}>Add new</button>
                    </div>
                  </Filter>
                </div>
                <div>
                  <NewTable
                    filterData={filterData}
                    filteredSearch={filteredSearch}
                    setFilterData={setfilterdata}
                    setFilteredSearch={setFilteredSearch}
                    columns={[
                      {
                        name: "Buyer Name", filter: true, filter: true, filterDataKey: "Buyer Name", sort: [
                          { name: "Sort A-Z", selected: filter.sortBuyerName === "ASC", onActionClick: () => { setFilter({ ...filter, sortBuyerName: 'ASC', sortShipments: false }); setrefresh(refresh + 1) } },
                          { name: "Sort Z-A", selected: filter.sortBuyerName === "DESC", onActionClick: () => { setFilter({ ...filter, sortBuyerName: "DESC", sortShipments: false }); setrefresh(refresh + 1) } }]
                      },
                      { name: "DUNS No." },
                      { name: "Country" },
                      { name: "Limit Available" },
                      // { name: "Next shipment date ", filter: true },
                      { name: "Turnover" }
                    ]}
                    data={dbData}
                    options={[
                      { name: "Profile", icon: "eye.png", onClick: onView },
                      { name: "Buyer Health", icon: "eye.png", onClick: onCheckBuyerHealthClick },
                      { name: "Edit", icon: "edit.png", onClick: onEdit },
                      { name: "Delete", icon: "delete.png", onClick: onDelete },
                      { name: "Get Finance Limi", icon: "ArrowBack.png", onClick: onGetLimit }
                    ]}
                  />
                  <Pagination page={page} totalCount={Count} onPageChange={(p) => setpage(p)} refresh={refresh} setRefresh={setrefresh} perPage={filter.resultPerPage || 10} />

                </div>
              </div>
            }

          </div>
          <div className='row pt-5 mb-3'>
            <div className='w-80 align-items-center d-flex'>
              <div className='w-auto pr-3'>
                <label className='text-color-value font-size-14 font-wt-600'>Custom</label>
              </div>
              <div className='w-15 pr-3'>
                <NewInput type={"date"} name={"invoiceLcApplicationFrom"} value={graphConfiguration.invoiceLcApplicationFrom}
                  onChange={handleGraphConfigurationChange} />
              </div>
              <div className='w-15 pr-3'>
                <NewInput type={"date"} name={"invoiceLcApplicationTo"} value={graphConfiguration.invoiceLcApplicationTo}
                  onChange={handleGraphConfigurationChange} />
              </div>
            </div>
            <div className='w-20 align-items-center d-flex justify-content-end'>
              <div className='pr-3'>
                <img
                  onClick={() => { setGraphConfiguration({ ...graphConfiguration, invoiceLcGraphMode: !graphConfiguration.invoiceLcGraphMode }) }}
                  className='cursor'
                  src={`/assets/images/${graphConfiguration.invoiceLcGraphMode ? 'filterTableMode' : 'filterGraphMode'}.png`} />
              </div>
              <div className=''>
                <img
                  onClick={downloadInvoiceLcApplicationData}
                  className='cursor' src='/assets/images/download_icon_with_bg.png' />
              </div>
            </div>
          </div>

          <div className='card p-3 dashboard-card border-0 borderRadius h-100'>
            {graphConfiguration.invoiceLcGraphMode ? (
              <div className='row'>
                <div className='col-md-6'>
                  {stats?.lcSummary ? (
                    <div className='col-md-12 text-center ml-9rem'>
                      <PieChartComponent hideDollar={true}
                        customToolTip={<CustomTooltipForInvoiceLc data={stats.lcSummary} />}
                        data={[{ type: "Approved", value: stats.lcSummary.approved },
                        { type: "Rejected", value: stats.lcSummary.rejected },
                        { type: "Inprocess", value: stats.lcSummary.pending }]} dataKey="value" colors={invoiceLcStatusColor} cornerRadius={30} totalVal={stats.lcSummary.totalApplication} />
                    </div>
                  ) : null}
                  <label className='font-wt-600 font-size-16 text-color-value w-90 text-center'>LC Application</label>
                </div>

                <div className='col-md-6'>
                  {stats?.invSummary ? (
                    <div className='col-md-12 text-center ml-9rem'>
                      <PieChartComponent hideDollar={true}
                        customToolTip={<CustomTooltipForInvoiceLc data={stats.invSummary} />}
                        data={[{ type: "Approved", value: stats.invSummary.approved },
                        { type: "Rejected", value: stats.invSummary.rejected },
                        { type: "Inprocess", value: stats.invSummary.pending }]} dataKey="value" colors={invoiceLcStatusColor} cornerRadius={30} totalVal={stats.invSummary.totalApplication} />
                    </div>
                  ) : null}
                  <label className='font-wt-600 font-size-16 text-color-value w-90 text-center'>Invoice Application</label>
                </div>

                <div className="d-flex justify-content-center pt-3">
                  {invoiceLcStatus.map((i, index) => {
                    return (
                      <div className='d-flex mr-4'>
                        <div style={{ width: '40px', height: '20px', backgroundColor: invoiceLcStatusColor[index] }}>
                        </div>
                        <label className='ml-3 text-center font-size-14 font-wt-600'>{i.label}</label>
                      </div>
                    )
                  })}
                </div>

              </div>
            ) : (
              <NewTable
                disableAction={true}
                columns={[{ name: "Application Status" }, { name: "Approved Application" }, { name: "Approved Amount ($)" },
                { name: "Rejected Application" }, { name: "Rejected Amount ($)" }, { name: "Inprocess Application" }, { name: "Inprocess Amount ($)" }
                ]}
                data={stats.tableDataForInvoiceLcApplication || []}
              />
            )}
          </div>
        </>
      }
    </>
  )
}

export default BuyersTab