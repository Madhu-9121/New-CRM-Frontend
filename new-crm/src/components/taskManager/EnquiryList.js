import moment from 'moment'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import call from '../../service'
import { NewTable } from '../../utils/newTable'
import Filter from '../InvoiceDiscounting/components/Filter'
import Pagination from '../InvoiceDiscounting/contract/components/pagination'
import HeaderV2 from '../partial/headerV2'
import SideBarV2 from '../partial/sideBarV2'
import ExportersTab from '../UserOnboard/ExportersTab'
import UserDetails from '../UserOnboard/UserDetails'
import ChannelPartnerDetails from '../UserOnboard/ChannelPartnerDetails'
import toastDisplay from '../../utils/toastNotification'
import { addDaysSkipSundays, getInitials, insertObjectInArray, isEmpty, productTypes } from '../../utils/myFunctions'
import { InputWithSelect, NewInput, NewSelect, NewTextArea } from '../../utils/newInput'
import { Area, AreaChart, Bar, BarChart, Funnel, Legend, Line, FunnelChart, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import PieChartComponent from '../Reports/components/PieChartComponent'
import BottomPopup from './BottomPopup'
import MultipleSelect from '../../utils/MultipleSelect'
import { reminders } from '../chatRoom/components/calenderView'
import SendEmailPopup from './SendEmailPopup'
import axios from 'axios'
import { platformBackendUrl } from '../../urlConstants'

// const salesPerson = [
//   "Nishi",
//   "Fiza",
//   "Manju",
//   "Dhruvi"
// ]

const lanesColor = ['#E8AF7B', '#98BCDE', '#FDB601', '#F887E0']

let applicationStageFunnelGraphColors = ["#FF774D", "#FFA64C", "#F26191", "#CC66FF", "#39BF3F"]

let inactiveUserFunnelGraphColors = ["#FF774D", "#FFA64C", "#F26191", "#CC66FF", "#39BF3F"]

const EnquiryList = ({ userTokenDetails, navToggleState, renderAsChildren, hideGraphs, showForThisUser, changedFilterData, setChangedFilterData }) => {

  let todayDateObj = moment()
  let lastMonthDateObj = moment().subtract("1", "months")

  const [refresh, setRefresh] = useState(0)
  const [filter, setFilter] = useState({ resultPerPage: 10 })
  const [filterData, setFilterData] = useState({})
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [dbData, setdbData] = useState([])
  const [transactionPopup, toggleTransactionPopup] = useState({ show: false, data: [] })
  const [showLoader, setshowLoader] = useState(false)
  const [viewDetails, setViewDetails] = useState({
    type: '',
    isVisible: false,
    data: {}
  })
  const [overalldata, setoveralldata] = useState([])
  const [salesPerson, setSalesPerson] = useState([])
  const [notePopup, toggleNotePopup] = useState({ show: false, data: "", selectedIndex: null, noteFor: "" })
  const [statsdata, setstatsdata] = useState({})
  const [graphConfiguration, setGraphConfiguration] = useState({
    applicationStageGraphMode: true,
    applicationStageFrom: lastMonthDateObj.clone().format("YYYY-MM-DD"),
    applicationStageTo: todayDateObj.clone().format("YYYY-MM-DD"),
    newUserGraphMode: true,
    newUserSummaryFrom: lastMonthDateObj.clone().format("YYYY-MM-DD"),
    newUserSummaryTo: todayDateObj.clone().format("YYYY-MM-DD")
  })
  const [graphData, setGraphData] = useState({})
  const [isOpen, setIsOpen] = useState({
    data: null,
    isVisible: false
  });
  const [isOpenDidntRec, setisOpenDidntRec] = useState({
    isVisible: false,
    selectedIndex: 0
  })
  const [isOpenCallback, setisOpenCallback] = useState({
    isVisible: false,
    selectedIndex: 0
  })
  const [isOpenNotInt, setisOpenNotInt] = useState({
    isVisible: false,
    selectedIndex: 0
  })
  const [isOpenLost, setisOpenLost] = useState({
    isVisible: false,
    selectedIndex: 0
  })
  const [selectedExpIndex, setSelectedExpIndex] = useState(null)
  const [isMinimized, setISMinimized] = useState(false)
  const [closeLeadPopup, setcloseLeadPopup] = useState(false)
  const [closeEventName, setcloseEventName] = useState('')
  const [searchedLocation, setSearchedLocation] = useState([])
  const [search, setSearch] = useState('')
  const [callHistoryPopup, toggleCallHistoryPopup] = useState({ show: false, data: [] })
  const [activeIndex, setActiveIndex] = useState(null);
  const [data, setdata] = useState({
    phoneCode: '91', documentCurrencyCode: "USD", productType: 'Export LC Discounting',
    contactPersonTitle: "Mr"
  })
  const [errors, setErrors] = useState({})
  const [CurrentOverallEmailIds, setCurrentOverallEmailIds] = useState([])
  const [CurrentEmailIds, setCurrentEmailIds] = useState([])
  const [emailPopup, toggleemailPopup] = useState({ show: false, data: {}, selectedIndex: null, emailFor: "" })
  const [addEnquiryPopup, setEnquiryPopup] = useState({
    show: false
  })
  const [country, setCountry] = useState([])


  const userPermissionsForSubAdmin = JSON.parse(userTokenDetails.UserAccessPermission || "{}")
  const userId = userTokenDetails?.user_id
  let onlyShowForUserId = undefined

  useEffect(() => {
    axios.get(platformBackendUrl + "/getallCountry").then((result) => {
      if (result.data.message && result.data.message.length) {
        setCountry(result.data.message);
      }
    });
    // let isCacheExist = localStorage.getItem('taskManagerFilterData') != "{}"
    // if (!isCacheExist) {
    call('POST', 'getEnquiryAdminFilters', {}).then(res => {
      console.log("getEnquiryAdminFilters then", res);
      setFilterData(res)
    }).catch(err => { })
    getEnquiryStats()
    // }
  }, [])
  const getEnquiryStats = () => {
    call('POST', 'getEnquiryStats', { onlyShowForUserId }).then(result => {
      console.log('resulttttt', result);
      setstatsdata(result)
      // let dataObj = {}
      // if (result.length) {
      //   dataObj["newUsersCount"] = result[0]?.total_users + result[1]?.total_users
      //   dataObj["impexpCount"] = result[0]?.total_users
      //   dataObj["CPCount"] = result[1]?.total_users
      //   dataObj["leadsAssignedCount"] = result[0]?.lead_assigned + result[1]?.lead_assigned
      //   dataObj["leadsNotAssignedCount"] = result[0]?.lead_not_assigned + result[1]?.lead_not_assigned
      //   dataObj["AgreementPending"] = result[0]?.agreement_pending + result[1]?.agreement_pending
      //   setstatsdata(dataObj)
      // }
    }).catch(e => {

    })
  }
  const handleChange = async (event) => {
    if (event.persist) {
      event.persist()
    }
    setdata({ ...data, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: "" })
  }
  const updateEnquiryTask = (LOG_TYPE, index, type) => {
    let error = {}
    if (LOG_TYPE !== 'Lead Lost') {
      if (!data.event_status) {
        error.event_status = 'Mandatory Field'
      }
    }
    if (LOG_TYPE === 'Create New Task' || LOG_TYPE === 'Lead Created') {
      if (!data.event_date) {
        error.event_date = 'Mandatory Field'
      }
      if (!data.event_time) {
        error.event_time = 'Mandatory Field'
      }
      if (!data.reminder) {
        error.reminder = 'Mandatory Field'
      }
      if (!data.event_type) {
        error.event_type = 'Mandatory Field'
      }
      if (!data.assignedTo) {
        error.assignedTo = 'Mandatory Field'
      }
    } else if (LOG_TYPE === 'Didnt connect') {
      if (!data.assignedTo) {
        error.assignedTo = 'Mandatory Field'
      }
    } else if (LOG_TYPE === 'Call back') {
      if (!data.event_date) {
        error.event_date = 'Mandatory Field'
      }
      if (!data.event_time) {
        error.event_time = 'Mandatory Field'
      }
      if (!data.reminder) {
        error.reminder = 'Mandatory Field'
      }
      if (!data.assignedTo) {
        error.assignedTo = 'Mandatory Field'
      }
    } else if (LOG_TYPE === 'Not Interested') {
      if (!data.event_date) {
        error.event_date = 'Mandatory Field'
      }
      if (!data.assignedTo) {
        error.assignedTo = 'Mandatory Field'
      }
    }
    else if (LOG_TYPE === 'Lead Lost') {
      if (!data.reasonForLost) {
        error.reasonForLost = 'Mandatory Field'
      }
      if (!data.event_type) {
        error.event_type = 'Mandatory Field'
      }
    }
    if (type === 'closed') {
      error = {}
    }
    if (isEmpty(error)) {
      setshowLoader(true)
      let assignedObj = salesPerson.find(item => item.id == data.assignedTo) || {}
      let reqObj = {
        EVENT_TYPE: data.event_type,
        EVENT_STATUS: type === 'closed' ? "Call" : data.event_status,
        EVENT_TIME: data.event_date && data.event_time ? new Date(`${data.event_date} ${data.event_time}`).toISOString() : '',
        REMINDER: data.reminder,
        REMARK: data.remark ? data.remark : '',
        CREATED_BY: assignedObj.id,
        CONTACT_PERSON: data.contact_person,
        CONTACT_NUMBER: data.contact_number,
        LOG_TYPE,
        LOST_REASON: type === 'closed' ? "Lead Not interested" : data.reasonForLost,
        MEETING_LOCATION: data.meetLocation,
        MEETING_DURATION: data.meetdurationInHrs,
        MEETING_HEAD_COUNT: data.noOfPerson
      }
      reqObj["EXPORTER_CODE"] = overalldata[selectedExpIndex]?.id
      reqObj["EXPORTER_NAME"] = overalldata[selectedExpIndex]?.beneficiaryName || data.contact_person
      console.log("herrrrrrreee", overalldata[selectedExpIndex].beneficiaryName, reqObj["EXPORTER_NAME"])
      call('POST', 'updateEnquiryTask', reqObj).then(result => {
        toastDisplay(result, 'success')
        setshowLoader(false)
        handleClose()
        getTasks()
        getEnquiryStats()
        setdata({})
        setcloseLeadPopup(false)
      }).catch(e => {
        toastDisplay(e, 'error')
        setshowLoader(false)
      })
    } else {
      setErrors(error)
    }

  }

  const handleAccordianClick = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };
  const handleClose = () => {
    setIsOpen({
      data: {},
      isVisible: false
    });
    setisOpenDidntRec({
      isVisible: false,
      selectedIndex: 0
    })
    setisOpenCallback({
      isVisible: false,
      selectedIndex: 0
    })
    setisOpenNotInt({
      isVisible: false,
      selectedIndex: 0
    })
    setisOpenLost({
      isVisible: false,
      selectedIndex: 0
    })
  };

  useEffect(() => {
    setshowLoader(true)
    call('POST', 'getTaskManagerGraphData', graphConfiguration).then(res => {
      console.log("getTaskManagerGraphData response===============>", res);
      setshowLoader(false)
      let activeApplicationStageFunnelGraphData = []
      activeApplicationStageFunnelGraphData[0] = { "name": "Finance Limit", "value": res.activeUserApplicationSummary["Finance Limit"]["invoice"] + res.activeUserApplicationSummary["Finance Limit"]["lc"] }
      activeApplicationStageFunnelGraphData[1] = { "name": "Quote", "value": res.activeUserApplicationSummary["Quote"]["invoice"] + res.activeUserApplicationSummary["Quote"]["lc"] }
      activeApplicationStageFunnelGraphData[2] = { "name": "Termsheet/Contract", "value": res.activeUserApplicationSummary["Termsheet/Contract"]["invoice"] + res.activeUserApplicationSummary["Termsheet/Contract"]["lc"] }
      activeApplicationStageFunnelGraphData[3] = { "name": "Finance", "value": res.activeUserApplicationSummary["Finance"]["invoice"] + res.activeUserApplicationSummary["Finance"]["lc"] }
      activeApplicationStageFunnelGraphData[4] = { "name": "Agreement", "value": res.activeUserApplicationSummary["Agreement"]["invoice"] }
      activeApplicationStageFunnelGraphData[5] = { "name": "Approved", "value": res.activeUserApplicationSummary["Approved"]["invoice"] + res.activeUserApplicationSummary["Approved"]["lc"] }

      let inactiveUserDaysFunnelGraphData = []
      inactiveUserDaysFunnelGraphData[0] = { "name": "15 Days", "value": res.inactiveUserDayWiseSummary["15 Days"]["exporter"] + res.inactiveUserDayWiseSummary["15 Days"]["importer"] + res.inactiveUserDayWiseSummary["15 Days"]["channelPartner"] }
      inactiveUserDaysFunnelGraphData[1] = { "name": "30 Days", "value": res.inactiveUserDayWiseSummary["30 Days"]["exporter"] + res.inactiveUserDayWiseSummary["30 Days"]["importer"] + res.inactiveUserDayWiseSummary["30 Days"]["channelPartner"] }
      inactiveUserDaysFunnelGraphData[2] = { "name": "45 Days", "value": res.inactiveUserDayWiseSummary["45 Days"]["exporter"] + res.inactiveUserDayWiseSummary["45 Days"]["importer"] + res.inactiveUserDayWiseSummary["45 Days"]["channelPartner"] }
      inactiveUserDaysFunnelGraphData[3] = { "name": "60 Days", "value": res.inactiveUserDayWiseSummary["60 Days"]["exporter"] + res.inactiveUserDayWiseSummary["60 Days"]["importer"] + res.inactiveUserDayWiseSummary["60 Days"]["channelPartner"] }
      inactiveUserDaysFunnelGraphData[4] = { "name": "75 Days", "value": res.inactiveUserDayWiseSummary["75 Days"]["exporter"] + res.inactiveUserDayWiseSummary["75 Days"]["importer"] + res.inactiveUserDayWiseSummary["75 Days"]["channelPartner"] }

      let activeApplicationStageTableData = []
      activeApplicationStageTableData[0] = ["Invoice Discounting", res.activeUserApplicationSummary["Finance Limit"]["invoice"], res.activeUserApplicationSummary["Quote"]["invoice"], res.activeUserApplicationSummary["Termsheet/Contract"]["invoice"],
        res.activeUserApplicationSummary["Finance"]["invoice"], res.activeUserApplicationSummary["Agreement"]["invoice"], res.activeUserApplicationSummary["Approved"]["invoice"]]
      activeApplicationStageTableData[1] = ["LC Discounting", res.activeUserApplicationSummary["Finance Limit"]["lc"], res.activeUserApplicationSummary["Quote"]["lc"], res.activeUserApplicationSummary["Termsheet/Contract"]["lc"],
        res.activeUserApplicationSummary["Finance"]["lc"], 0, res.activeUserApplicationSummary["Approved"]["lc"]]

      let inactiveUserDaysTableData = []
      inactiveUserDaysTableData[0] = ["Exporter", res.inactiveUserDayWiseSummary["15 Days"]["exporter"], res.inactiveUserDayWiseSummary["30 Days"]["exporter"], res.inactiveUserDayWiseSummary["45 Days"]["exporter"],
        res.inactiveUserDayWiseSummary["60 Days"]["exporter"], res.inactiveUserDayWiseSummary["75 Days"]["exporter"]]
      inactiveUserDaysTableData[1] = ["Importer", res.inactiveUserDayWiseSummary["15 Days"]["importer"], res.inactiveUserDayWiseSummary["30 Days"]["importer"], res.inactiveUserDayWiseSummary["45 Days"]["importer"],
        res.inactiveUserDayWiseSummary["60 Days"]["importer"], res.inactiveUserDayWiseSummary["75 Days"]["importer"]]
      inactiveUserDaysTableData[2] = ["Channel Partner", res.inactiveUserDayWiseSummary["15 Days"]["channelPartner"], res.inactiveUserDayWiseSummary["30 Days"]["channelPartner"], res.inactiveUserDayWiseSummary["45 Days"]["channelPartner"],
        res.inactiveUserDayWiseSummary["60 Days"]["channelPartner"], res.inactiveUserDayWiseSummary["75 Days"]["channelPartner"]]

      setGraphData({
        ...res, activeApplicationStageFunnelGraphData, inactiveUserDaysFunnelGraphData, activeApplicationStageTableData, inactiveUserDaysTableData
      })
    })
  }, [graphConfiguration])

  useEffect(() => {
    if (userPermissionsForSubAdmin.mainAdmin || userPermissionsForSubAdmin?.["Assign Task"]) {
      setshowLoader(true)
      call("POST", 'getSubAdminUser', {}).then(res => {
        setshowLoader(false)
        setSalesPerson(res.data)
      }).catch(err => setshowLoader(false))
    }
  }, [])

  const getTasks = () => {
    setshowLoader(true)
    let dateRangeFilter = [moment().subtract(3, "days").format("YYYY-MM-DD"), moment().add(1, "days").format("YYYY-MM-DD")]
    let objectAPI = {
      dateRangeFilter,
      currentPage: page,
      ...filter,
      resultPerPage: filter.resultPerPage,
      onlyShowForUserId: onlyShowForUserId
    }
    for (let index = 0; index < Object.keys(filterData || {}).length; index++) {
      let filterName = Object.keys(filterData)[index]
      const element = filterData[filterName];
      if (element.isFilterActive) {
        if (element.type === "checkbox") {
          objectAPI[element.accordianId] = []
          element["data"].forEach((i) => {
            if (i.isChecked) {
              objectAPI[element.accordianId].push((element.accordianId === "newUserType" ||
                element.accordianId === "leadAssignmentStatus" ||
                element.accordianId === "leadStatus" || element.accordianId === "applicationStatus") ? i[element["labelName"]] : `'${i[element["labelName"]]}'`)
            }
          })
        }
        else if (element.type === "minMaxDate") {
          objectAPI[element.accordianId] = element["value"]
        }
      }
    }
    call('POST', 'getEnquiryList', objectAPI)
      .then((result) => {
        setdbData(formatDataForTable(result.message))
        setCount(result.total_count)
        setoveralldata(result.message)
        setshowLoader(false)
      }).catch(e => {
        setshowLoader(false)
      })
  }
  useEffect(() => {
    getTasks()
  }, [page, refresh, salesPerson, filterData])

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
  const updateLeadAssignedTo = (leadAssignedName, id) => {
    call('POST', 'updateEnquiryLeadAssignedTo', { leadAssignedName, id }).then(result => {
      toastDisplay("Lead updated", "success")
      getTasks()
    }).catch(e => {
      toastDisplay("Failed to assign lead to " + leadAssignedName, "error")
    })
  }
  function formatDataForTable(data) {
    let tableData = []
    let row = []
    console.log('SalesPersoon', salesPerson)
    data.forEach((item, index) => {

      row[0] = moment(item.createdAt).format('DD-MM-YYYY')
      row[1] = item.contactPerson || item.beneficiaryName || item.beneficiaryName || "-"
      row[2] = `${item.phoneCode ? "+" + item.phoneCode : ''} ${item.contactNo ? item.contactNo : ''}`
      row[3] = item.organizationName ? item.organizationName : '-'
      row[4] = item.productType
      row[5] = <div class="dropdown w-100" >
        <label class="font-wt-600 font-size-13 cursor" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
          {item.subAdminContactPersonName || '-'}
        </label>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
          {salesPerson.map(element => {
            return <li className="dropdown-item cursor" onClick={() => updateLeadAssignedTo(element.id, item.id)} >{element.contact_person}</li>
          })}
        </ul>
      </div>

      row[6] = <span className='cursor' onClick={() => handleCallHistoryPopup(item)}>
        <span className='font-wt-600'>
          {item.LastEventTime ? moment(item.LastEventTime).format('DD/MM/YYYY') + ": " : ''}
        </span>
        <span className='font-wt-500'>
          {item.LastEventType ? item.LastEventType + "-" : ''}
        </span>
        <span className='font-wt-500' dangerouslySetInnerHTML={{ __html: item.LastNote ? item.LastNote.length > 60 ? item.LastNote.slice(0, 60) + "......." : item.LastNote : item.adminNote ? item.adminNote.length > 60 ? item.adminNote.slice(0, 60) + "......." : item.adminNote : '' }}>

        </span>
      </span>

      tableData.push(row)
      row = []
    })
    return tableData
  }

  function handleOpeningApplication(indx, tabIndx) {
    let item = overalldata[indx]
    if (item.finance_type == 'invoice_discounting') {
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

  const handleGraphConfigurationChange = async (event) => {
    if (event.persist) {
      event.persist()
    }
    setGraphConfiguration({ ...graphConfiguration, [event.target.name]: event.target.value })
  }

  const CustomTooltipForNewUserSummary = ({ payload }) => {
    return (
      <div
        className='bg-dark px-4 py-3'
        style={{
          borderRadius: 10
        }}>
        <p className='font-wt-600 text-custom2 font-size-14 m-0 p-0'>{`${graphData?.pieDataForUserOnboarded?.[payload?.[0]?.name]?.["type"]} - ${graphData?.pieDataForUserOnboarded?.[payload?.[0]?.name]?.["value"]}`}</p>
        <p className='font-wt-600 text-48DA87 font-size-14 m-0 p-0'>{`Active - ${graphData?.pieDataForUserOnboarded?.[payload?.[0]?.name]?.["active"]}`}</p>
        <p className='font-wt-600 colorFF7B6D font-size-14 m-0 p-0'>{`Inactive - ${graphData?.pieDataForUserOnboarded?.[payload?.[0]?.name]?.["inActive"]}`}</p>
      </div>
    );
  };

  async function downloadActiveUserApplicationStage() {
    if (!graphData.activeApplicationStageTableData?.length) {
      return toastDisplay('No data found to download', "info")
    }
    try {
      let temp = graphData.activeApplicationStageTableData
      let csvString = "Active Users (Application Stage),Finance Limit,Quote,Termsheet/Contract,Finance,Agreement,Approved\r\n"
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
      link.setAttribute('download', `ActiveUserApplicationStage.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log("error in downloadActiveUserApplicationStage", error);
    }
  }

  async function downloadInactiveUserDays() {
    if (!graphData.inactiveUserDaysTableData?.length) {
      return toastDisplay('No data found to download', "info")
    }
    try {
      let temp = graphData.inactiveUserDaysTableData
      let csvString = "Inactive Users(Days),15 Days,30 Days,45 Days,60 Days,75 Days\r\n"
      let rowString = `${temp[0][0]},${temp[0][1]},${temp[0][2]},${temp[0][3]},${temp[0][4]},${temp[0][5]}\r\n`
      rowString = rowString.replace(/(\n)/gm, "")
      csvString += rowString

      rowString = `${temp[1][0]},${temp[1][1]},${temp[1][2]},${temp[1][3]},${temp[1][4]},${temp[1][5]}\r\n`
      rowString = rowString.replace(/(\n)/gm, "")
      csvString += rowString

      rowString = `${temp[2][0]},${temp[2][1]},${temp[2][2]},${temp[2][3]},${temp[2][4]},${temp[2][5]}\r\n`
      rowString = rowString.replace(/(\n)/gm, "")
      csvString += rowString

      let link = document.createElement('a');
      link.style.display = 'none';
      link.setAttribute('target', '_blank');
      link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
      link.setAttribute('download', `InactiveUserSummary.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log("error in downloadInactiveUserDays", error);
    }
  }

  const handleMultiSelectchange = (e, name, val, singleSelect) => {
    if (singleSelect) {
      setdata({
        ...data,
        [name]: e?.[0]?.[val] ? e.reverse()?.[0]?.[val] : null
      })
    }
    else {
      setdata({
        ...data,
        [name]: Array.isArray(e) ? e.map((x) => x[val]) : []
      });
    }
  };

  async function handleCallHistoryPopup(itemData) {
    setshowLoader(true)
    let apiResp = await call('POST', 'getEnquiryHistory', {
      EXPORTER_CODE: itemData.id
    })
    // console.log("getTransactionHistoryForInvoiceLimit api resp====>", itemData, apiResp);
    setshowLoader(false)
    toggleCallHistoryPopup({ show: true, data: apiResp })
  }

  function handleQuoteValidation() {
    let validateArr = ["productType", "beneficiaryName", "phoneCode", "contactNo", "emailId", "contactPerson", "contactPersonTitle"]
    let err = {}
    // if (isLCSelected) {
    //   validateArr.push("lcIssuingBankName")
    // }
    // if (isInvoiceSelected) {
    //   validateArr.push("exporterCompanyName")
    //   validateArr.push("importerCompanyName")
    //   validateArr.push("importerContry")
    // }
    for (let index = 0; index < validateArr.length; index++) {
      const element = validateArr[index];
      if (!data[element]) {
        err[element] = "Mandatory Field"
      }
    }
    if (!Object.keys(err).length) {
      setshowLoader(true);
      let formData = new FormData()

      formData.append("productType", data.productType)
      formData.append("beneficiaryName", data.beneficiaryName)
      formData.append("phoneCode", data.phoneCode)
      formData.append("contactNo", data.contactNo)
      formData.append("emailId", data.emailId)
      formData.append("lcIssuingBankName", data.lcIssuingBankName)
      formData.append("documentCurrencyCode", data.documentCurrencyCode)
      formData.append("documentAmount", data.documentAmount)

      formData.append("organizationName", data.organizationName)
      formData.append("countryCode", data.countryCode)
      formData.append("message", data.message)
      formData.append("contactPersonTitle", data.contactPersonTitle)
      formData.append("contactPerson", data.contactPerson)
      formData.append("lcDocument", data.lcDocument)


      formData.append("invoiceDocument", data.invoiceDocument)
      formData.append("poDocument", data.poDocument)

      formData.append("exporterCompanyName", data.exporterCompanyName)
      formData.append("importerCompanyName", data.importerCompanyName)
      formData.append("importerContry", data.importerContry)

      fetch(`${platformBackendUrl}/createUserInquiry`, {
        method: "POST",
        body: formData
      })
        .then((result) => {
          setshowLoader(false);
          toastDisplay("Inquiry added", "success", () => {
            window.location.reload()
          });
        })
        .catch((err) => {
          setshowLoader(false);
          toastDisplay("Something went wrong", "error");
        });
    }
    setErrors(err)
  }

  return (
    <div className={renderAsChildren ? "" : "container-fluid"}>
      {addEnquiryPopup.show && <div className={`modal fade ${addEnquiryPopup.show && "show"}`} style={{ display: "block" }}>
        <div className="modal-dialog modal-md">
          <div className="modal-content submitmodal pb-4">
            <div className="modal-header border-0">
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setEnquiryPopup({ show: false })}></button>
            </div>
            <div className="modal-body text-center">
              <label className='font-size-16 font-wt-500 mb-4'>Add Enquiry</label>
              <div className="d-flex row justify-content-center">
                <div className='position-relative col-8'>
                  <NewSelect
                    optionLabel={"name"} optionValue={"name"} selectData={productTypes} label={'Product Type'}
                    value={data.productType} name={"productType"} onChange={handleChange} error={errors.productType} />
                </div>
                <div className='position-relative col-8'>
                  <NewInput label={"Organization Name"} name="organizationName" value={data.organizationName} onChange={handleChange}
                    error={errors.organizationName} />
                </div>
                <div className='position-relative col-8'>
                  <NewInput label={"Beneficiary Name"} name="beneficiaryName" value={data.beneficiaryName} onChange={handleChange}
                    error={errors.beneficiaryName} />
                </div>
                <div className='position-relative col-8'>
                  <InputWithSelect
                    selectData={[{ name: "Mr" }, { name: "Miss" }]} selectName={"contactPersonTitle"} selectValue={data.contactPersonTitle} optionLabel={"name"}
                    optionValue={"name"} type="text" name={"contactPerson"} value={data["contactPerson"]}
                    onChange={handleChange}
                    label={"Contact Person Name"} error={errors.contactPersonTitle || errors.contactPerson} />
                </div>
                <div className='position-relative col-8'>
                  <InputWithSelect
                    selectData={country} selectName={"phoneCode"} selectValue={data.phoneCode} optionLabel={"phonecode"}
                    optionValue={"phonecode"} type="number" name={"contactNo"} value={data["contactNo"]}
                    onChange={handleChange}
                    label={"Contact No"} error={errors.phoneCode || errors.contactNo} />
                </div>
                <div className='position-relative col-8'>
                  <NewInput label={"Email Id"} name="emailId" value={data.emailId} onChange={handleChange} error={errors.emailId} />
                </div>
              </div>
              <button type="button"
                onClick={() => {
                  handleQuoteValidation()
                }}
                className={`mx-2 new-btn w-25 py-2 px-2 mt-4 text-white`}>
                {"Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>}
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      {emailPopup.show &&
        <SendEmailPopup emailPopup={emailPopup} toggleemailPopup={toggleemailPopup} CurrentEmailIds={CurrentEmailIds} userId={userId} CurrentOverallEmailIds={CurrentOverallEmailIds} setCurrentOverallEmailIds={setCurrentOverallEmailIds} setCurrentEmailIds={setCurrentEmailIds} type={"TRF Admin Enquiry"} EXPORTER_CODE={emailPopup.data.id} EXPORTER_NAME={emailPopup.data.beneficiaryName} userName={userTokenDetails?.userName} successHandler={getTasks} />
      }
      <div className={`modal fade ${notePopup.show && "show"}`} style={notePopup.show ? { display: "block", "zIndex": '100001' } : {}}>
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal pb-4"
          >

            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label
                  className="font-size-16 font-wt-600 text-color-value mx-3"
                >{`Add Note for ${notePopup.noteFor}`}</label>
                <div className="modal-header border-0">
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => toggleNotePopup({ show: false, data: "", selectedIndex: null })}></button>
                </div>
              </div>
            </div>

            <div className="modal-body px-4">
              <div className="col-md-12 px-0">
                <div className="">
                  <NewTextArea
                    rows={6}
                    type={"text"} label={`Write Note`} name={"note"}
                    value={notePopup.data}
                    onChange={(e) => {
                      toggleNotePopup({ ...notePopup, data: e.target.value })
                    }}
                  />
                </div>
              </div>

              <button type="button"
                onClick={async () => {
                  setshowLoader(true)
                  let temp = overalldata[notePopup.selectedIndex]
                  // console.log("temp==========================>", overalldata, notePopup);
                  let req = { adminNote: notePopup.data, id: temp.id }

                  call('POST', 'addNoteForEnquiry', req).then(res => {
                    setshowLoader(false)
                    toastDisplay(res, "success")
                    setRefresh(refresh + 1)
                    toggleNotePopup({ show: false, data: "", selectedIndex: null })
                  }).catch(err => {
                    setshowLoader(false)
                    toastDisplay("Something went wrong", "error")
                  })
                }}
                className={`new-btn w-20 py-2 mt-2 px-2 text-white enablesigncontract text-white `}>
                {"Submit"}
              </button>

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

      <div className={`modal fade ${callHistoryPopup.show && "show"}`} style={callHistoryPopup.show ? { display: "block", "zIndex": '100001' } : {}}>
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal pb-4"
          >

            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label
                  className="font-size-16 font-wt-600 text-color-value mx-3"
                >Call History</label>
                <div className="modal-header border-0">
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => toggleCallHistoryPopup({ show: false, data: [] })}></button>
                </div>
              </div>
            </div>

            <div className="modal-body px-4">
              {callHistoryPopup.data.length ? callHistoryPopup.data.map((item, index) => {
                return (
                  <div className='d-flex flex-row ml-3'>
                    <div className="progressBarContainer2">
                      <div className="progressBarInnerCircle">
                      </div>
                    </div>
                    <div className='pl-4 pt-4 mt-2'>
                      <p className='font-size-14 text-color1 font-wt-500 mb-0'>
                        {item.CREATED_AT ? moment(item.CREATED_AT).format('Do MMM, YYYY - hh:mm A') : '-'}
                        <span><img src='assets/images/arrow.png' className='cursor' onClick={() => handleAccordianClick(index)} /></span>
                      </p>
                      {activeIndex === index &&
                        <div>
                          <p className='mb-0 font-size-14'>{item.LOG_TYPE}</p>
                          <p className='mb-0 font-size-14 text-break' dangerouslySetInnerHTML={{ __html: item.REMARK }}>
                          </p>
                          <p>
                            {item.CONTACT_PERSON && <span className='mb-0 font-size-14 font-wt-600'>{item.CONTACT_PERSON + " - "}</span>}
                            {item.CONTACT_NUMBER && <span className='mb-0 font-size-14 font-wt-600'>{item.CONTACT_NUMBER}</span>}
                          </p>
                          <p>
                            {item.EVENT_TIME &&
                              <span className='mb-0 font-size-14 '>Next followup date:
                                <span className='mb-0 font-size-14 '>
                                  {moment(item.EVENT_TIME).format('DD/MM/YYYY')}
                                </span>
                              </span>
                            }
                          </p>
                        </div>
                      }
                    </div>
                  </div>
                )
              }) :
                null}
            </div>

          </div>
        </div>
      </div>
      {isOpen.isVisible &&
        <BottomPopup isOpen={isOpen.isVisible} onClose={handleClose}>
          <div className='CreateNewTaskDiv'>
            <div className='d-flex flex-row align-items-center gap-3 justify-content-between'>
              {/* <p className='font-size-16 text-color1 font-wt-600 mb-0'>Create Task</p> */}
              <button className={` new-btn py-2 px-3 text-white cursor`} onClick={() => updateEnquiryTask('Create New Task', null)}>Save Task</button>
              <button className={` new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => { updateEnquiryTask('Lead Created', null) }}>Add to Lead</button>
              <p className='font-size-16 text-color1 font-wt-600 mb-0 text-decoration-underline cursor' onClick={() => {
                setcloseLeadPopup(true)
                setcloseEventName('')
              }}>Close lead</p>
              <div className='d-flex gap-3 align-items-center'>
                <img src='assets/images/arrow.png' className='cursor' onClick={() => setISMinimized(!isMinimized)} style={isMinimized ? { transform: "rotate(180deg)" } : {}} />
                <img src='assets/images/cross.png' className='cursor' onClick={handleClose} />
              </div>

            </div>
            {!isMinimized &&
              <div>
                <div className='row  p-0 mt-4'>
                  <div className='col-md-6'>
                    <NewInput
                      name={"contact_person"} label={'Contact Person Name'}
                      value={data.contact_person || ""} onChange={handleChange} error={errors.contact_person}
                    />
                  </div>
                  <div className='col-md-6'>
                    <NewInput
                      name={"contact_number"} label={'Contact Number'}
                      value={data.contact_number || ""} onChange={handleChange} error={errors.contact_number}
                    />
                  </div>
                </div>
                <div className='row'>
                  <div className='col-md-6'>
                    <NewSelect
                      selectData={[{ "label": "Call" }, { "label": "Offline Meet" }, { "label": "Online Meet" }]}
                      optionLabel={'label'} optionValue={'label'}
                      name={"event_type"} label={'Type'}
                      value={data.event_type} onChange={handleChange} error={errors.event_type}
                    />
                  </div>
                  <div className='col-md-6'>
                    <NewSelect
                      selectData={[{ "label": "Hot (30 days or less)" }, { "label": "Warm (30-60 days)" }, { "label": "Cold (60 days or more)" }]}
                      optionLabel={'label'} optionValue={'label'}
                      name={"event_status"} label={'Status'}
                      value={data.event_status} onChange={handleChange} error={errors.event_status}
                    />
                  </div>
                </div>
                {data.event_type?.includes("Meet") &&
                  <div className='row'>
                    <div className="col-md-6">
                      <div className="col-md-12 px-0">
                        <MultipleSelect
                          Id="Meet Location"
                          Label="Meet Location"
                          selectedvalue="Meet Location"
                          optiondata={searchedLocation}

                          onInputChange={(e) => {
                            console.log('On autocomplete change input', e)
                            //handleFilterOptions(e)
                            setSearch(e)
                          }}
                          onChange={(e) => handleMultiSelectchange(e, "meetLocation", "name", true)}
                          value={data.meetLocation ? [data.meetLocation] : []}
                          name="meetLocation"
                          labelKey={"name"}
                          valKey={"name"}
                          customStyles={{
                            backgroundColor: '#DEF7FF',
                            borderRadius: '10px'
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="col-md-12 px-0">
                        <NewInput isAstrix={true} type={"text"} label={"Duration(Hours)"}
                          name={"meetdurationInHrs"}
                          value={data.meetdurationInHrs} error={errors.meetdurationInHrs}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className='col-md-3'>
                      <NewInput isAstrix={true} type={"number"} label={"No of Person"}
                        name={"noOfPerson"}
                        value={data.noOfPerson} error={errors.noOfPerson}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                }

                <div className='row'>
                  <div className="col-md-4">
                    <div className="col-md-12 px-0">
                      <NewInput isAstrix={true} type={"date"} label={"Date"}
                        name={"event_date"}
                        value={data.event_date} error={errors.event_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="col-md-12 px-0">
                      <NewInput isAstrix={true} type={"time"} label={"Time"}
                        name={"event_time"}
                        value={data.event_time} error={errors.event_time}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className='col-md-4'>
                    <NewSelect
                      selectData={reminders} name={"reminder"}
                      optionLabel={'name'} optionValue={'name'}
                      label={'Reminder (before)'} error={errors.reminder}
                      value={data.reminder} onChange={handleChange}
                    />
                  </div>

                </div>
                <div className="col-md-12 p-0">
                  <NewTextArea
                    rows={6}
                    type={"text"} label={`Remark`} name={"remark"}
                    value={data.remark} error={errors.remark}
                    onChange={handleChange}
                  />
                </div>
                <div className="col p-0 ">
                  <div className="col-md-12 px-0">
                    <NewSelect
                      selectData={salesPerson}
                      optionLabel={'contact_person'} optionValue={'id'}
                      name={"assignedTo"} label={"Assign Task to"}
                      value={data.assignedTo} onChange={handleChange} error={errors.assignedTo}
                    />
                  </div>
                </div>
              </div>
            }

          </div>
        </BottomPopup>
      }

      {isOpenDidntRec.isVisible &&
        <BottomPopup isOpen={isOpenDidntRec.isVisible} onClose={() => setisOpenDidntRec({ isVisible: false, selectedIndex: 0 })}>
          <>
            <div className='d-flex flex-row align-items-center gap-3 justify-content-between'>
              <p className='font-size-16 text-color1 font-wt-600 mb-0'>Create Task <span className='text-color-767676 font-size-12'>(didn't connect)</span></p>
              <button className={` new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => updateEnquiryTask('Didnt connect', isOpenDidntRec.selectedIndex)}>Save Task</button>
              <img src='assets/images/arrow.png' className='cursor' onClick={() => setISMinimized(!isMinimized)} style={isMinimized ? { transform: "rotate(180deg)" } : {}} />
              <img src='assets/images/cross.png' className='cursor' onClick={() => setisOpenDidntRec({ isVisible: false, selectedIndex: 0 })} />
            </div>
            {!isMinimized &&
              <div>
                <div className='row  p-0 mt-4'>
                  <div className='col-md-6'>
                    <NewInput
                      name={"contact_person"} label={'Contact Person Name'}
                      value={data.contact_person || ""} onChange={handleChange} error={errors.contact_person}
                    />
                  </div>
                  <div className='col-md-6'>
                    <NewInput
                      name={"contact_number"} label={'Contact Number'}
                      value={data.contact_number || ""} onChange={handleChange} error={errors.contact_number}
                    />
                  </div>
                </div>
                <div className="col p-0">
                  <div className="col-md-12 px-0">
                    <NewSelect
                      selectData={[{ "label": "Busy" }, { "label": "Not Reachable" }, { "label": "Wrong Number" }, { "label": "Invalid Number" }, { label: "Switched off" }]}
                      optionLabel={'label'} optionValue={'label'}
                      name={"event_status"} label={'Current Call Status'}
                      value={data.event_status} onChange={handleChange} error={errors.event_status}
                    />
                  </div>
                </div>
                <div className="col-md-12 p-0">
                  <NewTextArea
                    rows={6}
                    type={"text"} label={`Remark`} name={"remark"}
                    value={data.remark} error={errors.remark}
                    onChange={handleChange}
                  />
                </div>
                <div className="col p-0 ">
                  <div className="col-md-12 px-0">
                    <NewSelect
                      selectData={salesPerson}
                      optionLabel={'contact_person'} optionValue={'id'}
                      name={"assignedTo"} label={"Assign Task to"}
                      value={data.assignedTo} onChange={handleChange} error={errors.assignedTo}
                    />
                  </div>
                </div>

              </div>
            }

          </>
        </BottomPopup>
      }

      {isOpenCallback.isVisible &&
        <BottomPopup isOpen={isOpenCallback.isVisible} onClose={() => setisOpenCallback({ isVisible: false, selectedIndex: 0 })}>
          <>
            <div className='d-flex flex-row align-items-center gap-3 justify-content-between'>
              <p className='font-size-16 text-color1 font-wt-600 mb-0'>Create Task <span className='text-color-767676 font-size-12'>(Call back)</span></p>
              <button className={` new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => updateEnquiryTask('Call back', isOpenCallback.selectedIndex)}>Save Task</button>
              <img src='assets/images/arrow.png' className='cursor' onClick={() => setISMinimized(!isMinimized)} style={isMinimized ? { transform: "rotate(180deg)" } : {}} />
              <img src='assets/images/cross.png' className='cursor' onClick={() => setisOpenCallback({ isVisible: false, selectedIndex: 0 })} />
            </div>
            {!isMinimized &&
              <div>
                <div className='row  p-0 mt-4'>
                  <div className='col-md-6'>
                    <NewInput
                      name={"contact_person"} label={'Contact Person Name'}
                      value={data.contact_person || ""} onChange={handleChange} error={errors.contact_person}
                    />
                  </div>
                  <div className='col-md-6'>
                    <NewInput
                      name={"contact_number"} label={'Contact Number'}
                      value={data.contact_number || ""} onChange={handleChange} error={errors.contact_number}
                    />
                  </div>
                </div>
                <div className='row'>
                  <div className="col-md-4">
                    <div className="col-md-12 px-0">
                      <NewInput isAstrix={true} type={"date"} label={"Date"}
                        name={"event_date"}
                        value={data.event_date} error={errors.event_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="col-md-12 px-0">
                      <NewInput isAstrix={true} type={"time"} label={"Time"}
                        name={"event_time"}
                        value={data.event_time} error={errors.event_time}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className='col-md-4'>
                    <NewSelect
                      selectData={reminders} name={"reminder"}
                      optionLabel={'name'} optionValue={'name'}
                      label={'Reminder (before)'} error={errors.reminder}
                      value={data.reminder} onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-12 p-0">
                  <NewTextArea
                    rows={6}
                    type={"text"} label={`Remark`} name={"remark"}
                    value={data.remark} error={errors.remark}
                    onChange={handleChange}
                  />
                </div>
                <div className="col p-0 ">
                  <div className="col-md-12 px-0">
                    <NewSelect
                      selectData={salesPerson}
                      optionLabel={'contact_person'} optionValue={'id'}
                      name={"assignedTo"} label={"Assign Task to"}
                      value={data.assignedTo} onChange={handleChange} error={errors.assignedTo}
                    />
                  </div>
                </div>

              </div>
            }

          </>
        </BottomPopup>
      }

      {isOpenNotInt.isVisible &&
        <BottomPopup isOpen={isOpenNotInt.isVisible} onClose={() => setisOpenNotInt({ isVisible: false, selectedIndex: 0 })}>
          <>
            <div className='d-flex flex-row align-items-center gap-3 justify-content-between'>
              <p className='font-size-16 text-color1 font-wt-600 mb-0'>Create Task <span className='text-color-767676 font-size-12'>(Not Interested)</span></p>
              <button className={` new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => updateEnquiryTask('Not Interested', isOpenNotInt.selectedIndex)}>Save Task</button>
              <img src='assets/images/arrow.png' className='cursor' onClick={() => setISMinimized(!isMinimized)} style={isMinimized ? { transform: "rotate(180deg)" } : {}} />
              <img src='assets/images/cross.png' className='cursor' onClick={() => setisOpenNotInt({ isVisible: false, selectedIndex: 0 })} />
            </div>
            {!isMinimized &&
              <div>
                <div className='row  p-0 mt-4'>
                  <div className='col-md-6'>
                    <NewInput
                      name={"contact_person"} label={'Contact Person Name'}
                      value={data.contact_person || ""} onChange={handleChange} error={errors.contact_person}
                    />
                  </div>
                  <div className='col-md-6'>
                    <NewInput
                      name={"contact_number"} label={'Contact Number'}
                      value={data.contact_number || ""} onChange={handleChange} error={errors.contact_number}
                    />
                  </div>
                </div>
                <div className='row'>
                  <div className="col-md-8">
                    <div className="col-md-12 px-0">
                      <NewSelect
                        selectData={[{ "label": "Busy" }, { "label": "Not Reachable" }, { "label": "Other" }]}
                        optionLabel={'label'} optionValue={'label'}
                        name={"event_status"} label={'Current Call Status'}
                        value={data.event_status} onChange={handleChange} error={errors.event_status}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="col-md-12 px-0">
                      <NewInput isAstrix={true} type={"date"} label={"Date"}
                        name={"event_date"}
                        value={data.event_date} error={errors.event_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-12 p-0">
                  <NewTextArea
                    rows={6}
                    type={"text"} label={`Remark`} name={"remark"}
                    value={data.remark} error={errors.remark}
                    onChange={handleChange}
                  />
                </div>
                <div className="col p-0 ">
                  <div className="col-md-12 px-0">
                    <NewSelect
                      selectData={salesPerson}
                      optionLabel={'contact_person'} optionValue={'id'}
                      name={"assignedTo"} label={"Assign Task to"}
                      value={data.assignedTo} onChange={handleChange} error={errors.assignedTo}
                    />
                  </div>
                </div>

              </div>
            }

          </>
        </BottomPopup>
      }

      {isOpenLost.isVisible &&
        <BottomPopup isOpen={isOpenLost.isVisible} onClose={() => setisOpenLost({ isVisible: false, selectedIndex: 0 })}>
          <>
            <div className='d-flex flex-row align-items-center gap-3 justify-content-between'>
              <p className='font-size-16 text-color1 font-wt-600 mb-0'>Lost</p>
              <button className={`new-btn-reject2 py-2 px-3 text-color-E74C3C cursor`} onClick={() => updateEnquiryTask('Lead Lost', isOpenLost.selectedIndex)}>Save Task</button>
              <img src='assets/images/arrow.png' className='cursor' onClick={() => setISMinimized(!isMinimized)} style={isMinimized ? { transform: "rotate(180deg)" } : {}} />
              <img src='assets/images/cross.png' className='cursor' onClick={() => setisOpenLost({ isVisible: false, selectedIndex: 0 })} />
            </div>
            {!isMinimized &&
              <div>
                <div className='row  p-0 mt-4'>
                  <div className='col-md-6'>
                    <NewInput
                      name={"contact_person"} label={'Contact Person Name'}
                      value={data.contact_person || ""} onChange={handleChange} error={errors.contact_person}
                    />
                  </div>
                  <div className='col-md-6'>
                    <NewInput
                      name={"contact_number"} label={'Contact Number'}
                      value={data.contact_number || ""} onChange={handleChange} error={errors.contact_number}
                    />
                  </div>
                </div>
                <div className='row'>
                  <div className="col-md-6">
                    <div className="col-md-12 px-0">
                      <NewSelect
                        selectData={[{ "label": "Busy" }, { "label": "Not Reachable" }, { "label": "Other" }]}
                        optionLabel={'label'} optionValue={'label'}
                        name={"reasonForLost"} label={'Reason for lost'}
                        value={data.reasonForLost} onChange={handleChange} error={errors.reasonForLost}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="col-md-12 px-0">
                      <NewSelect
                        selectData={[{ "label": "Call" }, { "label": "Offline Meet" }, { "label": "Online Meet" }]}
                        optionLabel={'label'} optionValue={'label'}
                        name={"event_type"} label={'Contact Mode'}
                        value={data.event_type} onChange={handleChange} error={errors.event_type}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-12 p-0">
                  <NewTextArea
                    rows={6}
                    type={"text"} label={`Remark`} name={"remark"}
                    value={data.remark} error={errors.remark}
                    onChange={handleChange}
                  />
                </div>
              </div>
            }

          </>
        </BottomPopup>
      }

      <div className="row">
        {!renderAsChildren ?
          <SideBarV2 state={"taskManagerEnquiry"} userTokenDetails={userTokenDetails} /> : null}
        <main role="main" className={`ml-sm-auto col-lg-${renderAsChildren ? '12' : '10'} ` + (navToggleState.status ? " expanded-right" : "")} id="app-main-div">
          {!renderAsChildren ?
            <HeaderV2
              title={"Task Manager"}
              userTokenDetails={userTokenDetails} /> : null}
          {viewDetails.isVisible && viewDetails.type == 'Exporter' &&
            <div className='mt-4'>
              <UserDetails data={viewDetails.data} goBack={() => {
                setViewDetails({
                  isVisible: false,
                  data: {},
                  type: ''
                })
              }} userTokenDetails={viewDetails.data} />
            </div>
          }
          {viewDetails.isVisible && viewDetails.type == 'Channel Partner' &&
            <div className='mt-4'>
              <ChannelPartnerDetails data={viewDetails.data} goBack={() => {
                setViewDetails({
                  isVisible: false,
                  data: {},
                  type: ''
                })
              }} userTokenDetails={viewDetails.data} />
            </div>
          }
          {!viewDetails.isVisible &&
            <>
              <div className='row mt-4'>
                <div className='w-20 pl-0'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <label className='w-100 font-size-14 text-color-value font-wt-600 pt-2 text-left'>{`Web Inquiries - `}
                      <label className='font-size-14 text-color-value font-wt-600 text-custom2'>{statsdata.totalCount || 0}</label></label>
                    <div className='row px-0 w-100'>
                      <div className='w-50 cursor'
                        onClick={() => {
                          let temp = filterData
                          console.log('filterdataaaaaa', temp)
                          temp["Enquiry Type"]["data"][0]["isChecked"] = true
                          temp["Enquiry Type"]["data"][1]["isChecked"] = false
                          temp["Enquiry Type"]["isFilterActive"] = true
                          setFilterData({ ...temp })
                        }}>
                        <label className={`value font-wt-600  w-100 cursor`}>
                          {statsdata.generalCount || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"General"}</label>
                      </div>

                      <div className='w-50 cursor'
                        onClick={() => {
                          let temp = filterData
                          temp["Enquiry Type"]["data"][0]["isChecked"] = false
                          temp["Enquiry Type"]["data"][1]["isChecked"] = true
                          temp["Enquiry Type"]["isFilterActive"] = true
                          setFilterData({ ...temp })
                        }}>
                        <label className={`value font-wt-600 w-100 cursor`}>
                          {statsdata.quotesCount || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"Quote"}</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='w-20'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <label className={`w-100  value font-wt-600 text-custom2 text-left`}>
                      {statsdata.leadsCount || 0}
                    </label>
                    <label
                      onClick={() => {
                        let temp = filterData
                        temp["Lead Status"]["data"][1]["isChecked"] = true
                        temp["Lead Status"]["data"][0]["isChecked"] = false
                        temp["Lead Status"]["isFilterActive"] = true
                        setFilterData({ ...temp })
                      }}
                      className={'w-100 font-size-14 font-wt-700 text-color-value text-left cursor'}>{"Converted to Lead"}</label>
                  </div>
                </div>

                <div
                  onClick={() => {
                    let temp = filterData
                    for (let index = 0; index < temp["Lead Status"]["data"].length; index++) {
                      const element = temp["Lead Status"]["data"][index];
                      if (element.name === "Lead Lost") {
                        temp["Lead Status"]["data"][index]["isChecked"] = true
                      }
                      else {
                        temp["Lead Status"]["data"][index]["isChecked"] = false
                      }
                    }
                    temp["Lead Status"]["isFilterActive"] = true
                    setFilterData({ ...temp })
                  }}
                  className='w-20 cursor'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-between'>
                    <label className={`w-100  value font-wt-600 text-custom2 text-left`}>
                      {statsdata.leadsLostCount || 0}
                    </label>
                    <label className={'w-100 font-size-14 font-wt-700 text-color-value text-left'}>{"Marked as Lost"}</label>
                  </div>
                </div>
              </div>
              <div className="filter-div ml-0 mt-1">
                <Filter isAdditionalButton={true}
                  filterData={changedFilterData || filterData} setFilterData={setChangedFilterData || setFilterData} showFilterBtn={true}
                  showResultPerPage={true} count={count} filter={filter} setFilter={setFilter} refresh={refresh} setRefresh={setRefresh}>
                  <div className="d-flex gap-4">
                    <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={() => {
                      setEnquiryPopup({ show: true })
                    }}>Add New</button>
                  </div>
                </Filter>
              </div>

              <div className="mb-3">
                <NewTable
                  //columns={Shipmentcolumns} 
                  tableFixed data={dbData}
                  columns={[
                    { name: "Date" },
                    { name: "Name" },
                    { name: "Contact Number" },
                    { name: "Organization/beneficiary" },
                    { name: "Enquiry Type" },
                    { name: "Lead Assigned" },
                    { name: "Remark" },
                    { name: "Action" }

                  ]}
                  options={[
                    {
                      name: "Create Task", icon: "createTask.svg", onClick: (index) => {
                        setSelectedExpIndex(index)
                        const item = overalldata[index]
                        const days = addDaysSkipSundays(new Date(), 2)
                        const todaysdata = moment().format("hh:mm")
                        setdata({
                          ...data,
                          contact_person: item.beneficiaryName,
                          contact_number: item.contactNo,
                          event_type: "Call",
                          event_status: "Hot (30 days or less)",
                          event_date: moment(days).format('YYYY-MM-DD'),
                          event_time: todaysdata,
                          reminder: "30 minutes",
                          assignedTo: userTokenDetails?.user_id
                        })
                        setIsOpen({
                          isVisible: true,
                          data: item
                        })
                      }

                    },
                    {
                      name: "Didn’t connect", icon: "didntconnect.svg", onClick: (index) => {
                        setSelectedExpIndex(index)
                        const item = overalldata[index]
                        setdata({
                          ...data,
                          event_status: "Busy",
                          assignedTo: userTokenDetails?.user_id,
                          contact_person: item.beneficiaryName,
                          contact_number: item.contactNo,
                        })
                        setisOpenDidntRec({
                          isVisible: true,
                          selectedIndex: index
                        })
                      }
                    },
                    {
                      name: "Call Back", icon: "callback.svg", onClick: (index) => {
                        const days = moment().format('YYYY-MM-DD')
                        setSelectedExpIndex(index)
                        const item = overalldata[index]
                        const todaysdata = moment().add(5, "hours").format('hh:mm')
                        setdata({
                          ...data,
                          event_status: "Busy",
                          event_date: days,
                          event_time: todaysdata,
                          reminder: "30 minutes",
                          assignedTo: userTokenDetails?.user_id,
                          contact_person: item.beneficiaryName,
                          contact_number: item.contactNo,
                        })
                        setisOpenCallback({
                          isVisible: true,
                          selectedIndex: index
                        })
                      }

                    },
                    {
                      name: "Not Interested", icon: "not_intrested.svg", onClick: (index) => {
                        setSelectedExpIndex(index)
                        const item = overalldata[index]
                        let nextday = addDaysSkipSundays(new Date(), 7)
                        const days = moment(nextday).format('YYYY-MM-DD')
                        const todaysdata = moment(nextday).format('HH:mm')
                        setdata({
                          ...data,
                          event_status: "Busy",
                          event_date: days,
                          event_time: todaysdata,
                          assignedTo: userTokenDetails?.user_id,
                          contact_person: item.beneficiaryName,
                          contact_number: item.contactNo,
                        })
                        setisOpenNotInt({
                          isVisible: true,
                          selectedIndex: index
                        })
                      }
                    },
                    {
                      name: "Marked as lost", icon: "marked_as_lost.svg", onClick: (index) => {
                        setSelectedExpIndex(index)
                        const item = overalldata[index]
                        setdata({
                          ...data,
                          assignedTo: userTokenDetails?.user_id,
                          contact_person: item.beneficiaryName,
                          contact_number: item.contactNo,
                        })
                        setisOpenLost({
                          isVisible: true,
                          selectedIndex: index
                        })
                      }
                    },
                    {
                      name: "Add Note", icon: "edit.png", onClick: (index) => {
                        let temp = overalldata[index]
                        toggleNotePopup({ show: true, data: temp.invoiceLimitLeadNote || temp.lcLimitLeadNote || temp.adminNote, selectedIndex: index, noteFor: temp.contact_person })
                      }
                    },
                    {
                      name: "Send Mail", icon: "mail.png", onClick: (index) => {
                        const item = overalldata[index]
                        let noteFor = overalldata[index]?.beneficiaryName
                        toggleemailPopup({ data: item, show: true, selectedIndex: index, emailFor: noteFor })
                        setCurrentOverallEmailIds([{ "Email ID": item.emailId }])
                        setCurrentEmailIds([{ "Email ID": item.emailId }])
                      }

                    }
                  ]}
                />

              </div>
              <Pagination page={page} totalCount={count} onPageChange={(p) => setPage(p)} perPage={filter.resultPerPage || 10} />
            </>
          }
          {/* {hideGraphs ? null : (
            <div>
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
                        downloadInactiveUserDays()
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
                      data={graphData.activeApplicationStageTableData || []}
                      columns={[{ name: "Active Users(Application Stage)" }, { name: "Finance Limit" }, { name: "Quote" },
                      { name: "Termsheet/Contract" }, { name: "Finance" }, { name: "Agreement" }, { name: "Approved" }]}
                    />
                  </div>
                  <div className='mt-4'>
                    <NewTable
                      disableAction={true}
                      data={graphData.inactiveUserDaysTableData || []}
                      columns={[{ name: "Inactive Users(Days)" }, { name: "15 Days" }, { name: "30 Days" },
                      { name: "45 Days" }, { name: "60 Days" }, { name: "75 Days" }]}
                    />
                  </div>
                </>
              ) : (
                <div className='card p-3 dashboard-card border-0 borderRadius h-100 d-flex flex-row pt-5 pb-4 mx-3' >
                  <div className='col-6'>
                    {graphData?.activeApplicationStageFunnelGraphData?.length ? (
                      <>

                      </>
                    ) : null}
                  </div>

                  <div className='col-6'>
                    {graphData?.inactiveUserDaysFunnelGraphData?.length ? (
                      <>

                      </>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )} */}

          {/* <div className='row pt-5 mb-3'>
            <div className='w-80 align-items-center d-flex'>
              <div className='w-auto pr-3'>
                <label className='text-color-value font-size-14 font-wt-600'>Custom</label>
              </div>
              <div className='w-15 pr-3'>
                <NewInput type={"date"} name={"newUserSummaryFrom"} value={graphConfiguration.newUserSummaryFrom}
                  onChange={handleGraphConfigurationChange} />
              </div>
              <div className='w-15 pr-3'>
                <NewInput type={"date"} name={"newUserSummaryTo"} value={graphConfiguration.newUserSummaryTo}
                  onChange={handleGraphConfigurationChange} />
              </div>
            </div>
            <div className='w-20 align-items-center d-flex justify-content-end'>
              <div className='pr-3'>
                <img
                  onClick={() => { setGraphConfiguration({ ...graphConfiguration, newUserGraphMode: !graphConfiguration.newUserGraphMode }) }}
                  className='cursor'
                  src={`/assets/images/${graphConfiguration.newUserGraphMode ? 'filterTableMode' : 'filterGraphMode'}.png`} />
              </div>
              <div className=''>
                <img
                  // onClick={downloadUserOnboardData}
                  className='cursor' src='/assets/images/download_icon_with_bg.png' />
              </div>
            </div>
          </div> */}

          {/* <div className='card p-3 dashboard-card border-0 borderRadius'>
            {graphConfiguration.newUserGraphMode ? (
              <div className='row'>
                <div className='col-md-6'>
                  {graphData?.newUserSummaryGraphPieData?.length ? (
                    <div className='col-md-12 text-center ml-9rem'>
                      <PieChartComponent hideDollar={true}
                        customToolTip={<CustomTooltipForNewUserSummary />}
                        data={graphData.newUserSummaryGraphPieData} dataKey="value" colors={lanesColor} cornerRadius={30} totalVal={graphData.totalNewUserSummaryGraphPieData} />
                    </div>
                  ) : null}
                </div>

                <div className='col-md-6 row py-5 my-5'>
                  <div className='row align-items-center justify-content-center text-center'>
                    <label className='font-size-16 font-wt-600'>{"New Users"}</label>
                  </div>
                  {graphData?.newUserSummaryGraphPieData?.length ? graphData.newUserSummaryGraphPieData.map((i, index) => {
                    return (
                      <div className='row align-items-center justify-content-center'>
                        <div className=''
                          style={{ width: '40px', height: '20px', backgroundColor: lanesColor[index] }}>
                        </div>
                        <div className='w-30'>
                          <label className='text-center font-size-14 font-wt-600'>{i.type}</label>
                        </div>
                      </div>
                    )
                  }) : null}
                </div>
              </div>
            ) : (
              <NewTable
                disableAction={true}
                columns={[{ name: "New Users" }, { name: "Send Agreement" }, { name: "Sign Agreement" },
                { name: "Add Buyer" }, { name: "Apply For Limit" }, { name: "Apply For Finance" }]}
                data={graphData.newUsertableDataForUserOnboarded || []}
              />
            )}
          </div> */}

        </main>

      </div>
    </div>
  )
}
const mapStateToProps = state => {

  return {
    navToggleState: state.navToggleState,
    // channelPartnerAccountList: state.channelPartnerAccountList,
    // channelPartnerDisbursedInvoice: state.channelPartnerDisbursedInvoice,
    // channelPartnerRaisedInvoice: state.channelPartnerRaisedInvoice
  }
}
export default connect(mapStateToProps, null)(EnquiryList) 