import React, { useState } from 'react'
import { useEffect } from 'react'
import call from '../../service'
import MultipleSelect from '../../utils/MultipleSelect'
import { ClearCache, GetCache, getDocDetails, getInitials, most_used_currencies, removeDuplicates, SetCache } from '../../utils/myFunctions'
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
import swal from 'sweetalert'
import ChatBoxPopUp2 from '../chatRoom/components/ChatBoxPopUp2'

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

const ApplicationTab = ({ userTokenDetails, hideGraphs, adminId, adminTypeId }) => {

  let todayDateObj = moment()
  let lastMonthDateObj = moment().subtract("1", "months")

  const [filterData, setfilterdata] = useState([])
  const [filter, setFilter] = useState({ resultPerPage: 10 })
  const [refresh, setRefresh] = useState(0)
  const [Count, setCount] = useState(0)
  const [page, setpage] = useState(1)
  const [dbData, setdbData] = useState([])
  const [showLoader, setshowLoader] = useState(false)
  const [addBuyer, setAddBuyer] = useState(false)
  const [stats, setStats] = useState({
    applicationStats: {}
  })
  const [graphConfiguration, setGraphConfiguration] = useState({
    applicationStageGraphMode: true,
    applicationStageFrom: lastMonthDateObj.clone().format("YYYY-MM-DD"),
    applicationStageTo: todayDateObj.clone().format("YYYY-MM-DD"),
  })
  const [viewDetails, setViewDetails] = useState({
    type: '',
    isVisible: false,
    data: {}
  })
  const [overalldata, setoveralldata] = useState([])
  const [transactionPopup, toggleTransactionPopup] = useState({ show: false, data: [] })
  const [graphData, setGraphData] = useState({})
  const [stageTable, setStageTable] = useState([])
  const [filteredSearch, setFilteredSearch] = useState([])
  const [subadminPopup, togglesubadminPopup] = useState({ data: [], show: false, userId: '' })

  const [selectedChat, setSelectedChat] = useState({
    receiverName: '',
    receiverId: '',
    isChatOpen: false,
    logo: null
  })
  const [message, setTextMsg] = useState('')
  const [chatList, setChatList] = useState([])
  const [internalRemarks, setInternalRemarks] = useState([])
  const [internalRemarkPopup, setInternalRemarkPopup] = useState({
    show: false
  })
  const [addRemarkPopup, setAddRemarkPopup] = useState({
    show: false
  })
  const [data, setdata] = useState({ phone_code: "91", name_title: "Mr" })
  const [errors, setErrors] = useState({})

  console.log('UserTokenDetails', userTokenDetails)

  const userId = userTokenDetails.id ? userTokenDetails.id : null
  const userTypeId = userTokenDetails.type_id ? userTokenDetails.type_id : null


  useEffect(() => {
    getApplications()
  }, [refresh, page, filterData])
  useEffect(() => {
    call('POST', 'getApplicationsFilters', { userId }).then(res => {
      console.log("getApplicationsFilters then", res);
      setfilterdata(res)
      setFilteredSearch(res)
    }).catch(err => { })

  }, [])
  useEffect(() => {
    setshowLoader(true)
    call('POST', 'getApplicationStats', { userId }).then(result => {
      setStats(result)
      setshowLoader(false)
    }).catch(e => {
      setshowLoader(false)

    })
  }, [])
  const getChatDetails = (reqObj) => {
    call('POST', 'getChatsByUser', reqObj).then(async result => {
      let finalArr = []
      for (let i = 0; i <= result.length - 1; i++) {
        let obj = result[i]
        const element = result[i]
        if (element.docs) {
          obj["chatFile"] = await getDocDetails(parseInt(element.docs))
        }
        finalArr.push(obj)
      }
      setChatList(finalArr)
    }).catch(e => {
      console.log('error in getChatsByUser', e)
    })
  }

  const sendChatMsg = (file, parties) => {

    const formdata = new FormData()
    formdata.append('senderId', adminId)
    if (message) {
      formdata.append('textMessage', message)
    }
    if (file) {
      formdata.append('docs', file)
    }
    formdata.append(selectedChat.app_type_key, selectedChat.applicationId)
    formdata.append("includeAdmins", true)
    formdata.append("receiverId", selectedChat.receiverId)
    formdata.append("receiverParties", parties.join(","))

    formdata.append("userTypeId", adminTypeId)
    formdata.append("sellerId", selectedChat.sellerId)

    call('POST', 'sendChatMessageV2', formdata).then((result) => {
      console.log('success in sendChatMessageV2 ', result)
      getChatDetails({
        chat_room_id: result.id,
        loggedInUser: adminId
      })
    })
  }
  useEffect(() => {
    setshowLoader(true)
    call('POST', 'getTransactionCounts', { ...graphConfiguration, userId }).then(result => {
      setGraphData(result)
      setshowLoader(false)
      let overalldata = []
      const lcdata = []
      lcdata.push("LC")
      lcdata.push(result["LC_Limit_Count"])
      lcdata.push(result["LC_Quotes_Count"])
      lcdata.push(result["LC_Contracts_Count"])
      lcdata.push(result["LC_Apply_Fin_Count"])
      lcdata.push(result["LC_Agreement"])
      lcdata.push(result["LC_Approved_Fin_Count"])
      overalldata.push(lcdata)

      let invdata = []
      invdata.push("Invoice Discounting")
      invdata.push(result["INV_Limit_Count"])
      invdata.push(result["INV_Quotes_Count"])
      invdata.push(result["INV_Contracts_Count"])
      invdata.push(result["INV_Apply_Fin_Count"])
      invdata.push(result["INV_Agreement"])
      invdata.push(result["INV_Approved_Fin_Count"])
      overalldata.push(invdata)
      setStageTable(overalldata)

    }).catch(e => {
      console.log('errror in getTransactionCounts', e);
      setshowLoader(false)
    })
  }, [graphConfiguration])
  const getApplications = () => {
    let objectAPI = {
      "userId": userId,
      currentPage: page,
      // exactMatchId: editBuyer || undefined,
      ...filter,
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
    call('POST', 'getApplications', objectAPI).then((result) => {
      setshowLoader(false)
      console.log('running getBuyersDetail api-->', result, formatDataForTable(result.message));
      setdbData(formatDataForTable(result.message))
      setoveralldata(result.message)
      setCount(result.total_records);
    }).catch((e) => {
      // console.log('error in getBuyersDetail', e);
      setshowLoader(false)
    });
  }
  async function downloadActiveUserApplicationStage() {
    if (!stageTable?.length) {
      return toastDisplay('No data found to download', "info")
    }
    try {
      let temp = stageTable
      let csvString = "Application Stage,Finance Limit,Quote,Termsheet/Contract,Finance,Agreement,Approved\r\n"
      let rowString = `${temp[0][0]},${temp[0][1]},${temp[0][2]},${temp[0][3]},${temp[0][4]},${temp[0][5]},${temp[0][6]}\r\n`
      rowString = rowString.replace(/(\n)/gm, "")
      csvString += rowString

      rowString = `${temp[1][0]},${temp[1][1]},${temp[1][2]},${temp[1][3]},${temp[1][4]},${temp[1][5]},${temp[1][6]}\r\n`
      rowString = rowString.replace(/(\n)/gm, "")
      csvString += rowString

      let link = document.createElement('a');
      link.style.display = 'none';
      link.setAttribute('target', '_blank');
      link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
      link.setAttribute('download', `ApplicationStages.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log("error in downloadActiveUserApplicationStage", error);
    }
  }

  const handleGraphConfigurationChange = async (event) => {
    if (event.persist) {
      event.persist()
    }
    setGraphConfiguration({ ...graphConfiguration, [event.target.name]: event.target.value })
  }

  async function handleTransactionPopupLC(itemData) {
    setshowLoader(true)
    let apiResp = await call('POST', 'getTransactionHistoryForLC', {
      buyerId: itemData.buyerId, applicationId: itemData.applicationId
    })
    console.log("getTransactionHistoryForLC api resp====>", itemData, apiResp);
    setshowLoader(false)
    toggleTransactionPopup({ show: true, data: apiResp })
  }

  async function handleTransactionPopupINV(itemData) {
    setshowLoader(true)
    let apiResp = await call('POST', 'getTransactionHistoryForInvoiceLimit', {
      buyerId: itemData.buyerId,
      applicationId: itemData.applicationId,
      invRefNo: itemData.reference_no
    })
    // console.log("getTransactionHistoryForInvoiceLimit api resp====>", itemData, apiResp);
    setshowLoader(false)
    toggleTransactionPopup({ show: true, data: apiResp })
  }


  function formatDataForTable(data, financiers = []) {
    try {
      let tableData = []
      let row = []
      for (let index = 0; index < data.length; index++) {
        const item = data[index];

        let allDeniedCount = 0
        let allApprovedCount = 0
        let buyersCredit = []

        if (item.buyers_credit) {
          try {
            buyersCredit = JSON.parse(item.buyers_credit)
          } catch (error) {
            console.log("errinnnnnnnnnnnnn", item);
          }
          for (let index = 0; index < buyersCredit.length; index++) {
            const j = buyersCredit[index];
            if (j.financierAction === "deny" || j.status === 'denied') {
              allDeniedCount += 1
            }
            else {
              allApprovedCount += 1
            }
          }
        }

        row[0] = moment(item.updated_at).format('DD/MM/YYYY')
        row[1] = <label className='cursor font-size-13 font-wt-600'
          onClick={() => {
            window.location = `/buyerManagement?viewBuyerId=${item.id}&viewUserTypeId=19&viewUserId=${item.userId}`
          }}
        >{`${item.buyerName} (${item.buyerCountry})`}</label>
        row[2] = item.finance_type

        let selectedLenderName = item.selectedLenderName ? item.selectedLenderName.split(",") : []
        let selectedLenderId = item.selectedLenderId ? item.selectedLenderId.split(",") : []


        let unsendFinList = []

        for (let index = 0; index < financiers.length; index++) {
          const element = financiers[index];
          let isAlreadySent = false
          for (let j = 0; j < selectedLenderId.length; j++) {
            if (element.id / 1 == selectedLenderId[j] / 1) {
              isAlreadySent = true
            }
          }
          if (!isAlreadySent) {
            unsendFinList.push(element)
          }
        }
        let chatRoomIds = item.chatRoomIds?.toString()?.split(",") || []
        let chatRoomUsers = item.chatRoomUsers?.toString()?.split(",") || []
        let chatRoomUnreadMsgCount = item.chatRoomUnreadMsgCount?.toString()?.split(",") || []
        let lastMessageIds = item.lastMessageIds?.toString()?.split(",") || []

        row[3] = <div
          className=''
        >
          {selectedLenderName.length ? selectedLenderName.map((key, j) => {
            let isApprovedByFinancier = buyersCredit?.filter(i => {
              if ((i.lender_id / 1 == selectedLenderId[j] / 1) && (i.financierAction === "Approved" || i.status === "approved")) {
                return i
              }
            })?.[0]
            let isRejectedByFinancier = buyersCredit?.filter(i => {
              if ((i.lender_id / 1 == selectedLenderId[j] / 1) && (i.financierAction === "deny" || i.status === 'denied')) {
                return i
              }
            })?.[0]
            let isOnlyRemarkProvidedByFinancier = false
            if (!isApprovedByFinancier && !isRejectedByFinancier) {
              isOnlyRemarkProvidedByFinancier = item.buyersRemark?.[selectedLenderId[j] / 1]?.["isVisible"] ? true : false
            }
            let openChatRoomIndx = null
            chatRoomUsers.forEach((u, i) => {
              if (u?.split("::")[1] / 1 == selectedLenderId[j]) {
                openChatRoomIndx = i
              }
            })
            // console.log("itembuyerNameeeeeeeeeeeeeeeee", selectedLenderId[j], item.buyerName, chatRoomIds, chatRoomUsers, chatRoomUnreadMsgCount, openChatRoomIndx);

            return (
              <div
                className={`position-relative cursor ${isOnlyRemarkProvidedByFinancier ? ' textOrange ' : '   '}
              ${isApprovedByFinancier ? " text2ECC71 " : ''} ${isRejectedByFinancier ? ' text-danger ' : '   '}`} >
                {/* <label className='font-wt-600 font-size-22 position-absolute cursor' style={{ top: "-0.8rem" }} >{`.`}</label> */}
                <img className='cursor'
                  onClick={async () => {
                    let reqObj = {
                      userTypeId: adminTypeId,
                      senderId: adminId,
                      sellerId: item.userId,
                      receiverId: selectedLenderId[j],
                      textMessage: 'Hii',
                      chat_room_name: "CHAT" + new Date().getTime(),
                      includeAdmins: true,
                      receiverParties: selectedLenderId[j],
                      dontSendInitialMsg: true
                    }
                    if (item.finance_type === 'Invoice Discounting') {
                      reqObj["invApplicationId"] = item.tblId
                    } else {
                      reqObj["lcApplicationId"] = item.tblId
                    }
                    setshowLoader(true)
                    let apiResp = await call('POST', 'sendChatMessageV2', reqObj)
                    setshowLoader(false)
                    getChatDetails({
                      chat_room_id: apiResp.id,
                      loggedInUser: adminId
                    })
                    setSelectedChat({
                      chatRoomId: apiResp.id,
                      receiverName: `${key} - ${chatRoomIds[openChatRoomIndx] || apiResp.id}`,
                      applicationId: item.tblId,
                      parties: chatRoomUsers[openChatRoomIndx] || apiResp.parties,
                      userId: userId,
                      isChatOpen: true,
                      receiverId: selectedLenderId[j],
                      sellerId: item.userId,
                      app_type_key: item.finance_type === 'Invoice Discounting' ? 'invApplicationId' : 'lcApplicationId'
                    })
                  }}
                  src={lastMessageIds[openChatRoomIndx] && lastMessageIds[openChatRoomIndx] != "null" ? `assets/images/comment_filled.png` : `assets/images/chat.png`} />
                <label
                  onClick={() => { handleOpeningApplication(index, 0) }} className='ml-3 font-size-14  font-wt-600 cursor' >{`${key}`}
                  <span className='text-color1 mx-2' ><u>{chatRoomUnreadMsgCount[openChatRoomIndx] / 1 ? (chatRoomUnreadMsgCount[openChatRoomIndx] < 10 ? `0${chatRoomUnreadMsgCount[openChatRoomIndx]}` : chatRoomUnreadMsgCount[openChatRoomIndx]) : null}</u></span></label>
              </div>
            )
          }) : "NA"}
          {unsendFinList.length ? unsendFinList.map((i, j) => {
            return (<div
              onClick={async () => {
                setshowLoader(true)
                let reason = await call('POST', 'getReasonWhyApplicationNotSent', { quoteId: item.applicationId, lenderId: i.id })
                setshowLoader(false)
                if (typeof (reason) != 'object') {
                  reason = [reason]
                }
                let reasonTxt = reason.length ? `
                Why application wasn't sent -
                  ${reason.map((i, j) => {
                  return (j + 1 + "." + i + "\n")
                })}
                ` : ''
                swal({
                  title: "Are you sure?",
                  text: `                  
                  Do you want to send [${item.supplierName} - ${item.buyerName}] application to ${i.name} 
                  ${reasonTxt}`,
                  icon: "warning",
                  buttons: ["No", "Yes"],
                  dangerMode: true,
                })
                  .then((yes) => {
                    if (yes) {
                      setshowLoader(true)
                      call('POST', 'sendApplicationToFinancierById', {
                        quoteId: item.applicationId, buyerId: item.id,
                        userId: item.user_id, lenderId: i.id
                      }).then((res) => {
                        setshowLoader(false)
                        swal(res, {
                          icon: "success",
                        });
                        setRefresh(refresh + 1)
                      }).catch(err => { setshowLoader(false); toastDisplay("Something went wrong", "error") })
                    }
                  });
              }}
              className={`position-relative cursor `}>
              <label className='font-wt-600 font-size-22 position-absolute cursor text-C0C0C0' style={{ top: "-0.8rem" }} >{`.`}</label>
              <label className='ml-3 font-size-14  font-wt-600 cursor text-C0C0C0' >{`${i.name}`}</label>
            </div>)
          }) : null}
        </div>

        row[4] = item.termsOfPayment


        row[5] =
          allDeniedCount / 1 == selectedLenderName.length / 1 ?
            <>
              <button type="button"
                onClick={() => { handleTransactionPopup(item) }}
                class={`rejected text-white border-0 `}>
                {"Rejected"}
              </button>
              <div class="ellipsis-container">
                <p
                  onClick={async () => {
                    setshowLoader(true)
                    let resp = await call('POST', 'getAdminRemarks', { [item.finance_type === 'Invoice Discounting' ? 'invApplicationId' : 'lcApplicationId']: item.tblId })
                    setshowLoader(false)
                    setInternalRemarks(resp)
                    if (resp.length) {
                      setInternalRemarkPopup({ show: true, [item.finance_type === 'Invoice Discounting' ? 'invApplicationId' : 'lcApplicationId']: item.tblId })
                    }
                    else {
                      toastDisplay('No remarks added yet', "info")
                    }
                  }}
                  className='fs-16 fw-800 cursor mt-2 ml-2 ellipsis-text' >{item.lastInternalRemark || "Remark"}</p>
              </div>
            </> :
            moment().diff(moment(item.applicationCreatedAt), "days") >= 60 &&
              (!item.termSheetSignedByExporter || !item.termSheetSignedByBank) ?
              <>
                <button type="button"
                  onClick={() => { handleTransactionPopup(item) }}
                  class={`expiredStatus text-white border-0 `}>
                  {"Expired"}
                </button>
                <div class="ellipsis-container">
                  <p
                    onClick={async () => {
                      setshowLoader(true)
                      let resp = await call('POST', 'getAdminRemarks', { [item.finance_type === 'Invoice Discounting' ? 'invApplicationId' : 'lcApplicationId']: item.tblId })
                      setshowLoader(false)
                      setInternalRemarks(resp)
                      if (resp.length) {
                        setInternalRemarkPopup({ show: true, [item.finance_type === 'Invoice Discounting' ? 'invApplicationId' : 'lcApplicationId']: item.tblId })
                      }
                      else {
                        toastDisplay('No remarks added yet', "info")
                      }
                    }}
                    className='fs-16 fw-800 cursor mt-2 ml-2 ellipsis-text' >{item.lastInternalRemark || "Remark"}</p>
                </div>
              </> :
              (item.termSheetSignedByExporter && item.termSheetSignedByBank) ?
                <>
                  <button type="button"
                    onClick={() => { handleTransactionPopup(item) }}
                    class={`approved text-white border-0 `}>
                    {"Approved"}
                  </button>
                  <div class="ellipsis-container">
                    <p
                      onClick={async () => {
                        setshowLoader(true)
                        let resp = await call('POST', 'getAdminRemarks', { [item.finance_type === 'Invoice Discounting' ? 'invApplicationId' : 'lcApplicationId']: item.tblId })
                        setshowLoader(false)
                        setInternalRemarks(resp)
                        if (resp.length) {
                          setInternalRemarkPopup({ show: true, [item.finance_type === 'Invoice Discounting' ? 'invApplicationId' : 'lcApplicationId']: item.tblId })
                        }
                        else {
                          toastDisplay('No remarks added yet', "info")
                        }
                      }}
                      className='fs-16 fw-800 cursor mt-2 ml-2 ellipsis-text' >{item.lastInternalRemark || "Remark"}</p>
                  </div>
                </> :
                <>
                  <button type="button"
                    onClick={() => { handleTransactionPopup(item) }}
                    class={`inprogress text-white border-0 `}>
                    {"Inprogress"}
                  </button>
                  <div class="ellipsis-container">
                    <p
                      onClick={async () => {
                        setshowLoader(true)
                        let resp = await call('POST', 'getAdminRemarks', { [item.finance_type === 'Invoice Discounting' ? 'invApplicationId' : 'lcApplicationId']: item.tblId })
                        setshowLoader(false)
                        setInternalRemarks(resp)
                        if (resp.length) {
                          setInternalRemarkPopup({ show: true, [item.finance_type === 'Invoice Discounting' ? 'invApplicationId' : 'lcApplicationId']: item.tblId })
                        }
                        else {
                          toastDisplay('No remarks added yet', "info")
                        }
                      }}
                      className='fs-16 fw-800 cursor mt-2 ml-2 ellipsis-text' >{item.lastInternalRemark || "Remark"}</p>
                  </div>
                </>

        if (item.finance_type === 'Invoice Discounting') {
          if (!item.buyers_credit) {
            row[99] = <p className="font-size-12 text-color-value ml-3">
              <img src={"assets/images/warning.png"} alt="info" className="me-1" /> <span className=" mr-2"><b>
                Application sent by supplier, waiting for quote from financier</b> </span>
            </p>
          }

          if (item.termSheet && !item.termSheetSignedByExporter) {
            row[99] = <p className="font-size-12 text-color-value ml-3">
              <img src={"assets/images/warning.png"} alt="info" className="me-1" /> <span className=" mr-2"><b>
                Term sheet sent by financier</b> </span>
            </p>
          }
        } else {
          if (item.reviewPending) {
            row[99] = <p className="font-size-12 text-color-value ml-3">
              <img src={"assets/images/warning.png"} alt="info" className="me-1" /> <span className=" mr-2"><b>
                Application uploaded by supplier,</b> </span>
              <label
                onClick={() => {
                  localStorage.setItem("manualUserId", item.supplierUserId)
                  localStorage.setItem("manualUserName", item.supplierName)
                  localStorage.setItem("manualEmailId", item.supplierEmailId)
                  window.location = `/LcDiscounting?buyer=${item.buyerId}&purpose=${item.invRefNo}&id=${item.tblId}&adminView=true`
                }}
                className="text-color1 text-decoration-underline cursor mr-2">Fill the pending details</label>
            </p>
          }
          else if (!item.buyers_credit) {
            row[99] = <p className="font-size-12 text-color-value ml-3">
              <img src={"assets/images/warning.png"} alt="info" className="me-1" /> <span className=" mr-2"><b>
                Application sent by supplier, waiting for quote from financier</b> </span>
            </p>
          }
          else if (item.selectedFinancier && !item.quoteLocked) {
            row[99] = <p className="font-size-12 text-color-value ml-3">
              <img src={"assets/images/warning.png"} alt="info" className="me-1" /> <span className=" mr-2"><b>
                Financer selected by supplier, waiting for financier to lock the deal</b> </span>
            </p>
          }
        }


        tableData.push(row)
        row = []

      }
      return tableData
    } catch (error) {
      console.log("errinformatDataForTable", error);
      return []
    }
  }
  async function handleTransactionPopup(itemData) {
    setshowLoader(true)
    let apiResp = await call('POST', 'getTransactionHistoryForInvoiceLimit', {
      buyerId: itemData.buyerId, applicationId: itemData.tblId
    })
    console.log("getTransactionHistoryForInvoiceLimit api resp====>", itemData, apiResp);
    setshowLoader(false)
    toggleTransactionPopup({ show: true, data: apiResp })
  }
  useEffect(() => {
    getApplications()
  }, [])
  async function onView(index) {

  }

  function handleOpeningApplication(indx, tabIndx) {
    let item = overalldata[indx]
    if (item.finance_type == 'Invoice Discounting') {
      if (item.buyers_credit == null || item.selectedFinancier == null) {
        window.location = `/seeQuotes?buyer=${item.buyerId}`;
        localStorage.setItem("applicationId", item.tblId)
        localStorage.setItem("invIfAppliedNo", item.invRefNo)
        localStorage.setItem("isAdmin", true)
        localStorage.setItem("defaultTabForAdmin", tabIndx)
        localStorage.setItem("selectedLenderName", item.FinancierName)

        // setting manual user id & email for user
        localStorage.setItem("manualUserId", item.userId)
        localStorage.setItem("manualUserEmail", item.email_id)
      } else {
        window.location = `/sign-agreement`
        localStorage.setItem("item", JSON.stringify(item))
        localStorage.setItem("isAdminUser", true)
        localStorage.setItem("defaultSetTab", tabIndx)

        // setting manual user id & email for user
        localStorage.setItem("manualUserId", item.userId)
        localStorage.setItem("manualUserEmail", item.email_id)
        localStorage.setItem("headerBreadCum", "Invoice Discounting > Finance > Application Details")
      }
    } else {
      window.location = `/LcSeequotes?id=${item.tblId}`
      localStorage.setItem("isAdmin", true)
      localStorage.setItem("defaultTabForAdmin", tabIndx)

      // setting manual user id & email for user
      localStorage.setItem("manualUserId", item.userId)
      localStorage.setItem("manualUserEmail", item.email_id)
    }
  }

  const handleChange = async (event) => {
    event.persist()
    setdata({ ...data, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: "" })

  }


  return (
    <>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      {addRemarkPopup.show && <div className={`modal fade ${addRemarkPopup.show && "show"}`} style={{ display: "block" }}>
        <div className="modal-dialog modal-md">
          <div className="modal-content submitmodal pb-4">
            <div className="modal-header border-0">
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setAddRemarkPopup({ show: false })}></button>
            </div>
            <div className="modal-body text-center">
              <p>Add Remark</p>
              <div className="col-md-10 move-p">
                <textarea rows="4" cols="50" className={"form-control"} placeholder="Write a remark for internal purpose." name="addRemark" value={data.addRemark}
                  onChange={handleChange}
                />
              </div>
              <button type="button"
                onClick={() => {
                  if (!data.addRemark) {
                    return toastDisplay('Kindly add remark to continue', "info")
                  }
                  setshowLoader(true)
                  call('POST', 'addAdminRemark', {
                    userId: adminId, remark: data.addRemark, invApplicationId: addRemarkPopup.invApplicationId, lcApplicationId: addRemarkPopup.lcApplicationId
                  }).then(async (result) => {
                    toastDisplay("Remark added", "success")
                    setRefresh(refresh + 1)
                    setshowLoader(false)
                    setAddRemarkPopup({ show: false })
                  }).catch((error) => {
                    toastDisplay(error, "error")
                    setshowLoader(false)
                    setAddRemarkPopup({ show: false })
                  })
                }}
                className={`mx-2 new-btn w-25 py-2 px-2 mt-4 text-white`}>
                {"Send Remark"}
              </button>
            </div>
          </div>
        </div>
      </div>}
      <div className={`modal fade ${internalRemarkPopup.show && "show"}`} style={internalRemarkPopup.show ? { display: "block", "zIndex": '1000001' } : {}}>
        <div className="modal-dialog modal-md mr-0">
          <div className="modal-content submitmodal pb-4"
          >
            <div className="modal-header border-0">
              <div className="">
                <i onClick={() => { setInternalRemarkPopup({ show: false }) }}
                  class="fas fa-2x fa-arrow-left mx-1 icon-color cursor"></i>
                <label
                  className="font-size-16 font-wt-600 text-color-value mx-3"
                >Internal Remarks</label>
              </div>
            </div>
            <div className="modal-body px-4">
              <div className='d-flex row'>
                {internalRemarks.map((i, j) => {
                  return (
                    <div className='card-layout p-3 mb-4'>
                      <div>
                        <label className='col-7 font-size-14 font-wt-600'>{i.contact_person || "NA"}</label>
                        <label className='col-5 font-size-14 font-wt-600'>{moment(i.createdAt).format("DD/MM/YYYY hh:mm a") || "NA"}</label>
                      </div>
                      <p
                        style={{ whiteSpace: 'pre-wrap' }}
                        className='font-size-15 font-wt-500 mx-3'>{i.remark}</p>
                    </div>
                  )
                })}
              </div>
              <button style={{ height: '2rem', borderRadius: 0, fontSize: 18, background: '#5CB8D3' }} type="button"
                onClick={() => { setdata({ ...data, addRemark: "" }); setInternalRemarkPopup({ show: false }); setAddRemarkPopup({ show: true, invApplicationId: internalRemarkPopup.invApplicationId, lcApplicationId: internalRemarkPopup.lcApplicationId }) }}
                class={`text-white border-0 w-100 `}>
                {"Add Remark"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {selectedChat.isChatOpen &&
        <div className="chatboxDivFixed">
          <ChatBoxPopUp2
            chatList={chatList}
            user_avatar={selectedChat.logo}
            userId={selectedChat.userId}
            receiverName={selectedChat.receiverName}
            parties={selectedChat.parties}
            userTokenDetails={userTokenDetails}
            onChatSend={(file, parties) => sendChatMsg(file, parties)}
            message={message}
            setTextMsg={setTextMsg}
            reloadChatList={() => getChatDetails({
              chat_room_id: selectedChat.chatRoomId,
              loggedInUser: adminId
            })}
            onPopupClose={() => {
              setSelectedChat({
                receiverName: '',
                receiverId: '',
                userId: userId,
                isChatOpen: false,
                logo: ''
              })
              setRefresh(refresh + 1)
            }}
          />
        </div>
      }
      <div className='row mt-4'>

        <div className='w-25'>
          <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
            <label className='w-100 font-size-14 text-color-value font-wt-600 pt-2'>{`Ongoing Application - `}
              <label className='font-size-14 text-color-value font-wt-600 text-custom2'>{` ${stats["applicationStats"]["total_application_count"] || "NA"}`}</label></label>
            <div className='row px-0 w-100' >
              <div className='w-50 cursor' onClick={() => {
                let temp = filterData
                temp["Application Type"]["data"][0]["isChecked"] = true
                temp["Application Type"]["data"][1]["isChecked"] = true
                temp["Application Type"]["data"][2]["isChecked"] = true
                temp["Application Type"]["data"][3]["isChecked"] = false
                temp["Application Type"]["isFilterActive"] = true
                setfilterdata({ ...temp })
              }}>
                <label className={`value font-wt-600 .textFFB801  w-100`}>
                  {stats["applicationStats"]["lc_count"] || "NA"}
                </label>
                <label className={'font-size-13 font-wt-600 text-color-value'}>{"LC"}</label>
              </div>

              <div className='w-50 cursor' onClick={() => {
                let temp = filterData
                temp["Application Type"]["data"][0]["isChecked"] = false
                temp["Application Type"]["data"][1]["isChecked"] = false
                temp["Application Type"]["data"][2]["isChecked"] = false
                temp["Application Type"]["data"][3]["isChecked"] = true
                temp["Application Type"]["isFilterActive"] = true
                setfilterdata({ ...temp })
              }}>
                <label className={`value font-wt-600 text-48DA87 w-100`}>
                  {stats["applicationStats"]["invoice_count"] || "NA"}
                </label>
                <label className={'font-size-13 font-wt-600 text-color-value'}>{"Invoice Discounting"}</label>
              </div>
            </div>
          </div>
        </div>

        <div className='w-17'>
          <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
            <label className={`value font-wt-600 text-custom2`}>
              {`$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(stats["applicationStats"]["limit_available"])}` || "NA"}
            </label>
            <label className={'font-size-13 font-wt-600 text-color-value'}>{"Limit Available"}</label>
          </div>
        </div>

        <div className='w-40'>
          <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
            <div className='row px-0 w-100'>
              <div className='w-33'>
                <label className={`value font-wt-600 textFFB801 w-100`}>
                  {`$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(stats["applicationStats"]["finance_applied"])}` || "NA"}

                </label>
                <label className={'font-size-13 font-wt-600 text-color-value'}>{"Finance Applied"}</label>
              </div>
              <div className='w-33'>
                <label className={`value font-wt-600 text-48DA87  w-100`}>
                  {`$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(stats["applicationStats"]["finance_approved"])}` || "NA"}

                </label>
                <label className={'font-size-13 font-wt-600 text-color-value'}>{"Finance Approved"}</label>
              </div>

              <div className='w-33'>
                <label className={`value font-wt-600 colorFF7B6D w-100`}>
                  {`$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(stats["applicationStats"]["finance_rejected"])}` || "NA"}
                </label>
                <label className={'font-size-13 font-wt-600 text-color-value'}>{"Finance Rejected"}</label>
              </div>
            </div>
          </div>
        </div>

        <div className='w-17'>
          <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
            <div className='row px-0 w-100'>
              <div>
                <label className={`value font-wt-600 text-custom2 w-100`}>
                  {`$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(stats["applicationStats"]["disbursement_done"])}` || "NA"}
                </label>
                <label className={'font-size-13 font-wt-600 text-color-value'}>{"Disbursement"}</label>
              </div>

            </div>
          </div>
        </div>

      </div>
      <div className={`modal fade ${transactionPopup.show && "show"}`} style={transactionPopup.show ? { display: "block", "zIndex": '100001' } : {}}>
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal pb-4"
          >

            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label
                  className="font-size-16 font-wt-600 text-color-value mx-3"
                >Transaction History</label>
                <div className="modal-header border-0">
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => toggleTransactionPopup({ show: false, data: [] })}></button>
                </div>
              </div>
            </div>

            <div className="modal-body px-4">
              {transactionPopup.data.length ? transactionPopup.data.map((item, index) => {
                return (
                  <div className='d-flex flex-row ml-3'>
                    <div className="progressBarContainer">
                      <div className="progressBarInnerCircle">
                      </div>
                    </div>
                    <div className='pl-4 pt-3'>
                      <p className='font-size-14 text-color1 font-wt-500 mb-0'>{item.action}</p>
                      <p className='font-size-14 text-color-label font-wt-500 mb-0'>{item.date}</p>
                      <p className='font-size-14 text-color-label font-wt-500 mb-0'>{item.time}</p>
                    </div>
                  </div>
                )
              }) :
                null}
            </div>

          </div>
        </div>
      </div>
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      <div className='my-2 card p-3 dashboard-card border-0 borderRadius'>
        <div className='filter-div ml-4'>
          <Filter
            filteredSearch={filteredSearch}
            setFilteredSearch={setFilteredSearch}
            filterData={filterData} setFilterData={setfilterdata} showFilterBtn={true}
            showResultPerPage={true} count={Count} filter={filter} setFilter={setFilter} refresh={refresh} setRefresh={setRefresh} isAdditionalButton={true} >
            <div className="d-flex gap-4">
              <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={() => {
                localStorage.setItem("UserDetails", JSON.stringify({
                  ...userTokenDetails,
                  user_id: userTokenDetails.id,
                  email: userTokenDetails.email_id,
                  userName: userTokenDetails.company_name
                }))
                window.open(`/applyForLimit`, "_blank")
              }}>Create New Application</button>
            </div>
          </Filter>
        </div>
        <div>
          <NewTable
            filteredSearch={filteredSearch}
            setFilteredSearch={setFilteredSearch}
            filterData={filterData}
            setFilterData={setfilterdata}
            columns={[
              {
                name: "Date", filter: true, filterDataKey: "Date", sort: [
                  { name: "Sort Oldest", selected: filter.sortBydate === "ASC", onActionClick: () => { setFilter({ ...filter, sortBydate: 'ASC', sortBuyerName: false, sortFinName: false, sortAmount: false }); setRefresh(refresh + 1) } },
                  { name: "Sort Latest", selected: filter.sortBydate === "DESC", onActionClick: () => { setFilter({ ...filter, sortBydate: "DESC", sortBuyerName: false, sortFinName: false, sortAmount: false }); setRefresh(refresh + 1) } }]
              },
              {
                name: "Buyer", filter: true,
                filterDataKey: "Buyer Name",
                sort: [
                  { name: "Sort A-Z", selected: filter.sortBuyerName === "ASC", onActionClick: () => { setFilter({ ...filter, sortBuyerName: 'ASC', sortDateBy: false, sortExpName: false }); setRefresh(refresh + 1) } },
                  { name: "Sort Z-A", selected: filter.sortBuyerName === "DESC", onActionClick: () => { setFilter({ ...filter, sortBuyerName: "DESC", sortDateBy: false, sortExpName: false }); setRefresh(refresh + 1) } }]
              },
              {
                name: "Application Type", filter: true, filterDataKey: "Application Type"
              },
              {
                name: "Financer", filter: true, filterDataKey: "Financier Name", sort: [
                  { name: "Sort A-Z", selected: filter.sortFinName === "ASC", onActionClick: () => { setFilter({ ...filter, sortFinName: 'ASC', sortBuyerName: false, sortAmount: false }); setRefresh(refresh + 1) } },
                  { name: "Sort Z-A", selected: filter.sortFinName === "DESC", onActionClick: () => { setFilter({ ...filter, sortFinName: "DESC", sortBuyerName: false, sortAmount: false }); setRefresh(refresh + 1) } }]
              },
              {
                name: "Terms of Payment", filter: false
              },
              { name: "Status" }
            ]}
            data={dbData}
            options={[
              { name: "Application", onClick: (indx) => handleOpeningApplication(indx, 0) },
              { name: "Documents", onClick: (indx) => handleOpeningApplication(indx, 1) },
              { name: "Quote", onClick: (indx) => handleOpeningApplication(indx, 2) },
              // { name: "Chat with Supplier", onClick: () => null },
              // { name: "Chat with Buyer", onClick: () => null },
              {
                name: "Add Remark", onClick: (indx) => {
                  setdata({ ...data, addRemark: '' })
                  setAddRemarkPopup({ show: true, [overalldata[indx].finance_type === 'Invoice Discounting' ? 'invApplicationId' : 'lcApplicationId']: overalldata[indx]["tblId"] })
                }
              }
            ]}
          />
          <Pagination page={page} totalCount={Count} onPageChange={(p) => setpage(p)} refresh={refresh} setRefresh={setRefresh} perPage={filter.resultPerPage || 10} />

        </div>
      </div>
      {(hideGraphs || viewDetails.isVisible) ? null : (
        <div className='card p-3 dashboard-card border-0 borderRadius mt-5'>
          <div className='row  mb-3'>
            <div className='w-70 align-items-center d-flex'>
              <div className='w-auto pr-3'>
                <label className='text-color-value font-size-14 font-wt-600'>Custom</label>
              </div>
              <div className='w-20 pr-3'>
                <NewInput type={"date"} name={"applicationStageFrom"} value={graphConfiguration.applicationStageFrom}
                  onChange={handleGraphConfigurationChange} />
              </div>
              <div className='w-20 pr-3'>
                <NewInput type={"date"} name={"applicationStageTo"} value={graphConfiguration.applicationStageTo}
                  onChange={handleGraphConfigurationChange} />
              </div>
            </div>
            <div className='w-30 align-items-center d-flex justify-content-end'>
              <div className='px-3'>
                <img
                  onClick={() => { setGraphConfiguration({ ...graphConfiguration, applicationStageGraphMode: !graphConfiguration.applicationStageGraphMode }) }}
                  className='cursor'
                  src={`/assets/images/${graphConfiguration.applicationStageGraphMode ? 'filterTableMode' : 'filterGraphMode'}.png`} />
              </div>
              <div className=''>
                <img
                  onClick={() => {
                    downloadActiveUserApplicationStage()
                  }}
                  className='cursor' src='/assets/images/download_icon_with_bg.png' />
              </div>
            </div>
          </div>
          {!graphConfiguration.applicationStageGraphMode ? (
            <>
              <div>
                <NewTable
                  disableAction={true}
                  data={stageTable || []}
                  columns={[{ name: "Stage Wise Application Summary" }, { name: "Finance Limit" }, { name: "Quote" },
                  { name: "Termsheet/Contract" }, { name: "Finance" }, { name: "Agreement" }, { name: "Approved" }]}
                />
              </div>
            </>
          ) : (
            <div className='h-100 d-flex flex-row pt-5 pb-4 mx-3' >
              <div className='col-6'>
                {true ? (
                  <>
                    <div className='text-center h-90'>
                      <img src='assets/images/LC application funnel.png' width={"70%"} />
                    </div>
                    <label className='position-absolute font-size-16 font-wt-700 inact-15-days'>{graphData?.LC_Limit_Count}</label>
                    <label className='position-absolute font-size-16 font-wt-700 inact-30-days'>{graphData?.LC_Quotes_Count}</label>
                    <label className='position-absolute font-size-16 font-wt-700 inact-45-days'>{graphData?.LC_Contracts_Count}</label>
                    <label className='position-absolute font-size-16 font-wt-700  inact-60-days'>{graphData?.LC_Apply_Fin_Count}</label>
                    <label className='position-absolute font-size-16 font-wt-700 inact-75-days'>{graphData?.LC_Approved_Fin_Count}</label>
                  </>
                ) : null}
                <label className='text-color-value font-size-14 font-wt-600 w-100 text-center mt-3'>LC Application</label>
              </div>

              <div className='col-6'>
                {true ? (
                  <>
                    <div className='text-center h-90'>
                      <img src='assets/images/Invoice application funnel.png' width={"70%"} height={"90%"} />
                    </div>
                    <label className='position-absolute font-size-16 font-wt-700 appstage-fl'>{graphData?.INV_Limit_Count}</label>
                    <label className='position-absolute font-size-16 font-wt-700 appstage-qts'>{graphData?.INV_Quotes_Count}</label>
                    <label className='position-absolute font-size-16 font-wt-700 appstage-ts'>{graphData?.INV_Contracts_Count}</label>
                    <label className='position-absolute font-size-16 font-wt-700 appstage-fin'>{graphData?.INV_Apply_Fin_Count}</label>
                    <label className='position-absolute font-size-16 font-wt-700 appstage-agree'>{graphData?.INV_Agreement}</label>
                    <label className='position-absolute font-size-16 font-wt-700 appstage-approved'>{graphData?.INV_Approved_Fin_Count}</label>

                  </>
                ) : null}
                <label className='text-color-value font-size-14 font-wt-600 w-100 text-center mt-3'>Invoice Application</label>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default ApplicationTab