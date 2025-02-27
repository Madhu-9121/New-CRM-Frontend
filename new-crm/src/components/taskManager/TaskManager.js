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
import { ExportExcel, addDaysSkipSundays, getInitials, insertObjectInArray, isEmpty } from '../../utils/myFunctions'
import { NewInput, NewSelect, NewTextArea } from '../../utils/newInput'
import { Area, AreaChart, Bar, BarChart, Funnel, Legend, Line, FunnelChart, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import PieChartComponent from '../Reports/components/PieChartComponent'
import SubAdminPopup from '../adminNewUI/SubAdminPopup'
import FinanceInvoiceModal from '../InvoiceDiscounting/contract/components/financeinvoiceModal'
import BottomPopup from './BottomPopup'
import MultipleSelect from '../../utils/MultipleSelect'
import { reminders } from '../chatRoom/components/calenderView'
import SendEmailPopup from './SendEmailPopup'

// const salesPerson = [
//   "Nishi",
//   "Fiza",
//   "Manju",
//   "Dhruvi"
// ]
const createTaskDD = [
  { name: "Create New Task", img: "createTask.svg", label: "Create Task" },
  { name: "Call Didn't Connect", img: "didntconnect.svg", label: "Didn't Connect" },
  { name: "Call back requested", img: "callback.svg", label: "Call back" },
  { name: "Not Interested", img: "not_intrested.svg", label: "Not Interested" },
  { name: "Marked as Lost Lead", img: "marked_as_lost.svg", label: "Mark as Lost" }
]
const lanesColor = ['#E8AF7B', '#98BCDE', '#FDB601', '#F887E0']

let applicationStageFunnelGraphColors = ["#FF774D", "#FFA64C", "#F26191", "#CC66FF", "#39BF3F"]

let inactiveUserFunnelGraphColors = ["#FF774D", "#FFA64C", "#F26191", "#CC66FF", "#39BF3F"]

const TaskManager = ({ userTokenDetails, navToggleState, renderAsChildren, hideGraphs, showForThisUser, changedFilterData, setChangedFilterData, leadStatusIndex, applicationStatusIndex }) => {

  let todayDateObj = moment()
  let lastMonthDateObj = moment().subtract("1", "months")
  const [selectedExpIndex, setSelectedExpIndex] = useState(null)
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
  const [filteredSearch, setFilteredSearch] = useState([])
  const [subadminPopup, togglesubadminPopup] = useState({ data: [], show: false, userId: '' })
  const [selectedIndex, setSelectedIndex] = useState([])
  const [showdropdown, setshowdropdown] = useState(false)
  const [assignmentType, setAssignmentType] = useState('Single')
  const [data, setdata] = useState({})
  const [errors, setErrors] = useState({})
  const [callHistoryPopup, toggleCallHistoryPopup] = useState({ show: false, data: [] })
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
  const [isMinimized, setISMinimized] = useState(false)
  const [searchedLocation, setSearchedLocation] = useState([])
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(null);
  const [CurrentOverallEmailIds, setCurrentOverallEmailIds] = useState([])
  const [CurrentEmailIds, setCurrentEmailIds] = useState([])
  const [emailPopup, toggleemailPopup] = useState({ show: false, data: {}, selectedIndex: null, emailFor: "" })

  const userPermissionsForSubAdmin = JSON.parse(userTokenDetails.UserAccessPermission || "{}")
  const userId = userTokenDetails?.user_id
  let onlyShowForUserId = (userPermissionsForSubAdmin?.mainAdmin || userPermissionsForSubAdmin?.[`Task Manager Users Complete`]) ? undefined : userId
  const getLocationSearch = () => {
    setshowLoader(true)
    call('POST', 'getLocationSearch', { search: search }).then(result => {
      setSearchedLocation(result)
      setshowLoader(false)
    }).catch(e => {
      setshowLoader(false)
    })
  }
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search) {
        getLocationSearch()
      }
    }, 1000);
    return () => {
      clearTimeout(debounce)
    }
  }, [search])
  const handleChange = async (event) => {
    if (event.persist) {
      event.persist()
    }
    setdata({ ...data, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: "" })
  }
  useEffect(() => {
    console.log('changedFilterData', leadStatusIndex);
    if (leadStatusIndex === 0) {
      let temp = filterData
      temp["Lead Status"]["data"][0]["isChecked"] = true
      temp["Lead Status"]["data"][1]["isChecked"] = false
      temp["Lead Status"]["isFilterActive"] = true
      setFilterData({ ...temp })
      let temp2 = filteredSearch
      temp2["Lead Status"]["data"][0]["isChecked"] = true
      temp2["Lead Status"]["data"][1]["isChecked"] = false
      temp2["Lead Status"]["isFilterActive"] = true
      setFilteredSearch({ ...temp2 })
    } else if (leadStatusIndex === 1) {
      let temp = filterData
      temp["Lead Status"]["data"][0]["isChecked"] = false
      temp["Lead Status"]["data"][1]["isChecked"] = true
      temp["Lead Status"]["isFilterActive"] = true
      let temp2 = filteredSearch
      temp2["Lead Status"]["data"][0]["isChecked"] = false
      temp2["Lead Status"]["data"][1]["isChecked"] = true
      temp2["Lead Status"]["isFilterActive"] = true
      setFilteredSearch({ ...temp2 })
      setFilterData({ ...temp })
    }
  }, [leadStatusIndex])
  useEffect(() => {
    if (applicationStatusIndex === 0) {
      let temp = filterData
      temp["Application Status"]["data"][0]["isChecked"] = true
      temp["Application Status"]["data"][1]["isChecked"] = false
      temp["Application Status"]["data"][2]["isChecked"] = false
      temp["Application Status"]["isFilterActive"] = true
      setFilterData({ ...temp })
      let temp2 = filteredSearch
      temp2["Application Status"]["data"][0]["isChecked"] = true
      temp2["Application Status"]["data"][1]["isChecked"] = false
      temp2["Application Status"]["data"][2]["isChecked"] = false
      temp2["Application Status"]["isFilterActive"] = true
      setFilteredSearch({ ...temp2 })
    } else if (applicationStatusIndex === 1) {
      let temp = filterData
      temp["Application Status"]["data"][0]["isChecked"] = false
      temp["Application Status"]["data"][1]["isChecked"] = true
      temp["Application Status"]["data"][2]["isChecked"] = false
      temp["Application Status"]["isFilterActive"] = true
      setFilterData({ ...temp })
      let temp2 = filteredSearch
      temp2["Application Status"]["data"][0]["isChecked"] = false
      temp2["Application Status"]["data"][1]["isChecked"] = true
      temp2["Application Status"]["data"][2]["isChecked"] = false
      temp2["Application Status"]["isFilterActive"] = true
      setFilteredSearch({ ...temp2 })
    } else if (applicationStatusIndex === 2) {
      let temp = filterData
      temp["Application Status"]["data"][0]["isChecked"] = false
      temp["Application Status"]["data"][1]["isChecked"] = false
      temp["Application Status"]["data"][2]["isChecked"] = true
      temp["Application Status"]["isFilterActive"] = true
      setFilterData({ ...temp })
      let temp2 = filteredSearch
      temp2["Application Status"]["data"][0]["isChecked"] = false
      temp2["Application Status"]["data"][1]["isChecked"] = false
      temp2["Application Status"]["data"][2]["isChecked"] = true
      temp2["Application Status"]["isFilterActive"] = true
      setFilteredSearch({ ...temp2 })
    }

  }, [applicationStatusIndex])
  useEffect(() => {
    // let isCacheExist = localStorage.getItem('taskManagerFilterData') != "{}"
    // if (!isCacheExist) {
    let objectAPI = {
      onlyShowForUserId: showForThisUser ? showForThisUser : onlyShowForUserId ? onlyShowForUserId : undefined
    }

    call('POST', 'getTasksForAdminFilters', objectAPI).then(res => {
      console.log("getTasksForAdminFilters then", res);
      setFilterData(res)
      // const filtereddata = res?.[item?.filterDataKey]?.data.filter(item => true)
      // setFilteredSearch({
      //   ...res,
      //   [item?.filterDataKey]: {
      //     ...res[item?.filterDataKey],
      //     data: filtereddata
      //   }
      // })
      setFilteredSearch(res)
    }).catch(err => { })
    call('POST', 'getTasksStatsForAdmin', {}).then(result => {
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
    // }
  }, [])


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
      inactiveUserDaysFunnelGraphData[0] = { "name": "15 Days", "value": res.inactiveUserDayWiseSummary["15 Days"]["exporter"] + res.inactiveUserDayWiseSummary["15 Days"]["channelPartner"] + res.inactiveUserDayWiseSummary["15 Days"]["financers"] }
      inactiveUserDaysFunnelGraphData[1] = { "name": "30 Days", "value": res.inactiveUserDayWiseSummary["30 Days"]["exporter"] + res.inactiveUserDayWiseSummary["30 Days"]["channelPartner"] + res.inactiveUserDayWiseSummary["30 Days"]["financers"] }
      inactiveUserDaysFunnelGraphData[2] = { "name": "45 Days", "value": res.inactiveUserDayWiseSummary["45 Days"]["exporter"] + res.inactiveUserDayWiseSummary["45 Days"]["channelPartner"] + res.inactiveUserDayWiseSummary["45 Days"]["financers"] }
      inactiveUserDaysFunnelGraphData[3] = { "name": "60 Days", "value": res.inactiveUserDayWiseSummary["60 Days"]["exporter"] + res.inactiveUserDayWiseSummary["60 Days"]["channelPartner"] + res.inactiveUserDayWiseSummary["60 Days"]["financers"] }
      inactiveUserDaysFunnelGraphData[4] = { "name": "75 Days", "value": res.inactiveUserDayWiseSummary["75 Days"]["exporter"] + res.inactiveUserDayWiseSummary["75 Days"]["channelPartner"] + res.inactiveUserDayWiseSummary["75 Days"]["financers"] }

      let activeApplicationStageTableData = []
      activeApplicationStageTableData[0] = ["Invoice Discounting", res.activeUserApplicationSummary["Finance Limit"]["invoice"], res.activeUserApplicationSummary["Quote"]["invoice"], res.activeUserApplicationSummary["Termsheet/Contract"]["invoice"],
        res.activeUserApplicationSummary["Finance"]["invoice"], res.activeUserApplicationSummary["Agreement"]["invoice"], res.activeUserApplicationSummary["Approved"]["invoice"]]
      activeApplicationStageTableData[1] = ["LC Discounting", res.activeUserApplicationSummary["Finance Limit"]["lc"], res.activeUserApplicationSummary["Quote"]["lc"], res.activeUserApplicationSummary["Termsheet/Contract"]["lc"],
        res.activeUserApplicationSummary["Finance"]["lc"], 0, res.activeUserApplicationSummary["Approved"]["lc"]]

      let inactiveUserDaysTableData = []
      inactiveUserDaysTableData[0] = ["Exporter", res.inactiveUserDayWiseSummary["15 Days"]["exporter"], res.inactiveUserDayWiseSummary["30 Days"]["exporter"], res.inactiveUserDayWiseSummary["45 Days"]["exporter"],
        res.inactiveUserDayWiseSummary["60 Days"]["exporter"], res.inactiveUserDayWiseSummary["75 Days"]["exporter"]]
      inactiveUserDaysTableData[1] = ["financers", res.inactiveUserDayWiseSummary["15 Days"]["financers"], res.inactiveUserDayWiseSummary["30 Days"]["financers"], res.inactiveUserDayWiseSummary["45 Days"]["financers"],
        res.inactiveUserDayWiseSummary["60 Days"]["financers"], res.inactiveUserDayWiseSummary["75 Days"]["financers"]]
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
    } else {
      setshowLoader(true)
      call("POST", 'getSubAdminUser', { onlyUserId: onlyShowForUserId }).then(res => {
        setshowLoader(false)
        setSalesPerson(res.data)
      }).catch(err => setshowLoader(false))
    }
  }, [])

  const getTasks = (isDownload) => {
    if (!isDownload) {
      setshowLoader(true)
    }
    let dateRangeFilter = [moment().subtract(3, "days").format("YYYY-MM-DD"), moment().add(1, "days").format("YYYY-MM-DD")]
    let objectAPI = {
      dateRangeFilter,
      currentPage: page,
      resultPerPage: filter.resultPerPage,
      onlyShowForUserId: showForThisUser ? showForThisUser : onlyShowForUserId ? onlyShowForUserId : undefined,
      ...filter
    }
    if (isDownload) {
      delete objectAPI["currentPage"]
      delete objectAPI["resultPerPage"]
    }
    for (let index = 0; index < Object.keys(changedFilterData || filterData || {}).length; index++) {
      let filterName = Object.keys(changedFilterData || filterData)[index]
      const element = changedFilterData?.[filterName] || filterData[filterName];
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
    call('POST', 'getTasksForAdmin', objectAPI)
      .then((result) => {
        if (isDownload) {
          let finaldata = []
          for (let i = 0; i <= result?.message?.length - 1; i++) {
            const item = result?.message[i]
            try {
              console.log('in for loooopppp', item);
              let buyers_credit = item.buyers_credit ? JSON.parse(item.buyers_credit) : []
              let status = ''
              let type = ''
              if (!item.hasOwnProperty("buyers_credit")) {
                if (item.LeadAssignedTo === null) {
                  status = 'New User'
                } else if (item.LeadAssignedTo != null && item.buyers_count == null && item.type_id == 19) {
                  status = 'Buyer Not added'
                } else if (item.LeadAssignedTo != null && item.buyers_count != null && item.limit_count == null && item.type_id == 19) {
                  status = 'Limit not applied'
                }
                else if (item.type_id == 20 && item.CPStatus != 3) {
                  status = 'Agreement Pending'
                }
                else if (item.type_id == 20 && item.CPStatus == 3) {
                  status = 'Agreement Sent'
                } else if (item.type_id == 20) {
                  status = 'New User'
                }
                else {
                  status = 'New User'
                }

              }
              else if (item.buyers_credit === null) {
                status = "Waiting for financer quote"
              }
              else if (item.buyers_credit != null && item.selectedFinancier == null) {
                status = 'Quote Recieved'
              } else if (item.termSheetSignedByBank && item.termSheetSignedByExporter) {
                status = (item.invRefNo === 'lc_discounting' || item.invRefNo === 'lc_confirmation' || item.invRefNo === 'sblc') ? "Quote Locked" : "Limit Approved"
              } else if (item.termSheetSignedByExporter) {
                status = (item.invRefNo === 'lc_discounting' || item.invRefNo === 'lc_confirmation' || item.invRefNo === 'sblc') ? "Contract Signed by Exporter" : 'TermSheet signed by exporter'
              }
              else if (item.selectedFinancier) {
                status = 'Quote Selected by exporter'
              } else if (item.invRefNo === 'lc_discounting' || item.invRefNo === 'lc_confirmation') {
                if (buyers_credit.every(data => data.status === 'denied')) {
                  status = 'Limit Denied'
                }
              } else if (item.invRefNo != 'lc_discounting' && item.invRefNo != 'lc_confirmation' && item.invRefNo != 'sblc') {

                if (buyers_credit.every(data => data.financierAction === 'deny')) {
                  status = 'Limit Denied'
                }
              }
              if (!item.hasOwnProperty("buyers_credit")) {
                type = 'User Onboard'
              }
              else if (item.invRefNo === 'lc_discounting') {
                type = 'LC Discounting'
              } else if (item.invRefNo === 'lc_confirmation') {
                type = 'LC Confirmation'
              } else if (item.invRefNo === 'sblc') {
                type = 'SBLC'
              } else {
                type = 'Invoice Discounting'
              }
              let downloadObj = {
                'Company Name': item.company_name,
                'Application Number': item.finance_type === 'invoice_discounting' ? item.invRefNo ? item.invRefNo : `${getInitials(item.buyerName)}/${item.buyerCountry ? item.buyerCountry : '-'}/${item.requiredLimit ? item.requiredLimit : '-'}` : item.id ? item.id : '-',
                'Contact Person': item.contact_person,
                'Contact Number': item.contact_number,
                'Status': status,
                'Lead Assigned To': item.subAdminContactPersonName,
                'Application Type': type
              }
              console.log('FINALoBJ', downloadObj);
              finaldata.push(downloadObj)
            } catch (e) {
              console.log('error in download', e);
            }

          }
          ExportExcel(finaldata, `TaskManager_${new Date().getTime()}`)
        } else {
          setdbData(formatDataForTable(result.message))
          setCount(result.totalCount)
          setoveralldata(result.message)
          setshowLoader(false)
        }

      }).catch(e => {
        console.log('111111111111111111111111111111', e);
        setshowLoader(false)
      })
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
  const tasksAction = (index, item, expindex) => {
    if (index === 0) {
      // Step 1: Group the array by HS_CODES
      setSelectedExpIndex(expindex)
      const days = addDaysSkipSundays(new Date(), 2)
      const todaysdata = moment().format("hh:mm")
      setdata({
        ...data,
        contact_person: item.contact_person,
        contact_number: item.contact_number,
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
    else if (index === 1) {
      setSelectedExpIndex(expindex)
      setdata({
        ...data,
        event_status: "Busy",
        assignedTo: userTokenDetails?.user_id,
        contact_person: item.contact_person,
        contact_number: item.contact_number,
      })
      setisOpenDidntRec({
        isVisible: true,
        selectedIndex: expindex
      })
    } else if (index === 2) {
      const days = moment().format('YYYY-MM-DD')
      setSelectedExpIndex(expindex)
      const todaysdata = moment().add(5, "hours").format('hh:mm')
      setdata({
        ...data,
        event_status: "Busy",
        event_date: days,
        event_time: todaysdata,
        reminder: "30 minutes",
        assignedTo: userTokenDetails?.user_id,
        contact_person: item.contact_person,
        contact_number: item.contact_number,
      })
      setisOpenCallback({
        isVisible: true,
        selectedIndex: expindex
      })
    } else if (index === 3) {
      setSelectedExpIndex(expindex)
      let nextday = addDaysSkipSundays(new Date(), 7)
      const days = moment(nextday).format('YYYY-MM-DD')
      const todaysdata = moment(nextday).format('HH:mm')
      setdata({
        ...data,
        event_status: "Busy",
        event_date: days,
        event_time: todaysdata,
        assignedTo: userTokenDetails?.user_id,
        contact_person: item.contact_person,
        contact_number: item.contact_number
      })
      setisOpenNotInt({
        isVisible: true,
        selectedIndex: expindex
      })
    } else if (index === 4) {
      setSelectedExpIndex(expindex)
      setdata({
        ...data,
        assignedTo: userTokenDetails?.user_id,
        contact_person: item.contact_person,
        contact_number: item.contact_number,
      })
      setisOpenLost({
        isVisible: true,
        selectedIndex: expindex
      })
    }
  }
  const updateUserOnboardTask = (LOG_TYPE, index, type) => {
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
      reqObj["EXPORTER_CODE"] = overalldata[selectedExpIndex]?.userId
      reqObj["EXPORTER_NAME"] = overalldata[selectedExpIndex]?.company_name
      call('POST', 'updateUserOnboardTask', reqObj).then(result => {
        toastDisplay(result, 'success')
        setshowLoader(false)
        handleClose()
        getTasks()
        setdata({})
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
    getTasks()
  }, [page, refresh, salesPerson, filterData, changedFilterData])

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
  const updateLeadAssignedTo = (leadAssignedName, userId) => {
    call('POST', 'updateLeadAssignedTo', { leadAssignedName, userId }).then(result => {
      toastDisplay("Lead updated", "success")
      getTasks()
    }).catch(e => {
      toastDisplay("Failed to assign lead to " + leadAssignedName, "error")
    })
  }

  async function handleCallHistoryPopup(itemData) {
    setshowLoader(true)
    let apiResp = await call('POST', 'getUserOnboardedHistory', {
      EXPORTER_CODE: itemData.userId
    })
    // console.log("getTransactionHistoryForInvoiceLimit api resp====>", itemData, apiResp);
    setshowLoader(false)
    toggleCallHistoryPopup({ show: true, data: apiResp })
  }
  function formatDataForTable(data) {

    let obj = {
      "19": "Exporter",
      "8": "Bank",
      "20": "Channel Partner"
    }

    let tableData = []
    let row = []
    data.forEach((item, index) => {
      let days = moment().diff(item.updated_at, 'days') >= 7
      try {
        let buyers_credit = item.buyers_credit ? JSON.parse(item.buyers_credit) : []
        let status = ''
        if (!item.hasOwnProperty("buyers_credit")) {
          if (item.LeadAssignedTo === null) {
            status = 'New User'
          } else if (item.LeadAssignedTo != null && item.buyers_count == null && item.type_id == 19) {
            status = 'Buyer Not added'
          } else if (item.LeadAssignedTo != null && item.buyers_count != null && item.limit_count == null && item.type_id == 19) {
            status = 'Limit not applied'
          }
          else if (item.type_id == 20 && item.CPStatus != 3) {
            status = 'Agreement Pending'
          }
          else if (item.type_id == 20 && item.CPStatus == 3) {
            status = 'Agreement Sent'
          } else if (item.type_id == 20) {
            status = 'New User'
          }
          else {
            status = 'New User'
          }

        }
        else if (item.buyers_credit === null) {
          status = "Waiting for financer quote"
        }
        else if (item.buyers_credit != null && item.selectedFinancier == null) {
          status = 'Quote Recieved'
        } else if (item.termSheetSignedByBank && item.termSheetSignedByExporter) {
          status = (item.invRefNo === 'lc_discounting' || item.invRefNo === 'lc_confirmation' || item.invRefNo === 'sblc') ? "Quote Locked" : "Limit Approved"
        } else if (item.termSheetSignedByExporter) {
          status = (item.invRefNo === 'lc_discounting' || item.invRefNo === 'lc_confirmation' || item.invRefNo === 'sblc') ? "Contract Signed by Exporter" : 'TermSheet signed by exporter'
        }
        else if (item.selectedFinancier) {
          status = 'Quote Selected by exporter'
        } else if (item.invRefNo === 'lc_discounting' || item.invRefNo === 'lc_confirmation') {
          if (buyers_credit.every(data => data.status === 'denied')) {
            status = 'Limit Denied'
          }
        } else if (item.invRefNo != 'lc_discounting' && item.invRefNo != 'lc_confirmation' && item.invRefNo != 'sblc') {

          if (buyers_credit.every(data => data.financierAction === 'deny')) {
            status = 'Limit Denied'
          }
        }

        row[0] = <label className={` mb-0`}>{item.company_name}</label>
        row[1] = <label className={`mb-0`}>{`${item.name_title ? item.name_title : ''} ${item.contact_person ? item.contact_person : ''}`}</label>
        row[2] = <label className={` mb-0`}>{`${item.phone_code ? "+" + item.phone_code : ''} ${item.contact_number ? item.contact_number : ''}`}</label>
        row[3] = <label className={`mb-0`}>{obj[item.type_id]}</label>
        row[4] = <div class="dropdown w-100" >
          <label class={`font-wt-600 font-size-13 cursor `} onClick={() => {
            if (item.subAdminContactPersonName) {
              togglesubadminPopup({
                show: true,
                data: [],
                userId: item.userId
              })
            } else {
              setSelectedIndex([index])
              setshowdropdown(true)
            }

          }}>
            {item.subAdminContactPersonName || '-'}
          </label>
        </div>
        row[5] = <label className={` mb-0`}>{moment().diff(item.updated_at, 'days') + " days"}</label>
        row[6] = <label className={`text-color1 font-wt-600 cursor`} onClick={() => {
          if ((status === 'New User' || status === 'Agreement Pending') && item.type_id == 20) {
            setViewDetails({
              isVisible: true,
              type: "Channel Partner",
              data: {
                type_id: item.type_id,
                id: item.userId,
                email_id: item.email_id,
                company_name: item.company_name,
                ...item
              }
            })
          }
          else if ((status === 'New User' || status === 'Limit Denied' || status === 'Buyer Not added') && item.type_id == 19) {
            setViewDetails({
              isVisible: true,
              type: "Exporter",
              data: {
                type_id: item.type_id,
                id: item.userId,
                email_id: item.email_id,
                company_name: item.company_name,
                ...item
              }
            })
          }
          else if (item.invRefNo === 'lc_discounting' || item.invRefNo === 'lc_confirmation' || item.invRefNo === 'sblc') {
            handleTransactionPopupLC({
              buyerId: item.buyerId,
              applicationId: item.tblId
            })
          } else {
            handleTransactionPopupINV({
              buyerId: item.buyerId,
              applicationId: item.tblId,
              invRefNo: item.invRefNo
            })
          }
        }}>{status}</label>
        row[7] = <span className='cursor' onClick={() => handleCallHistoryPopup(item)}>
          <span className='font-wt-600'>
            {item.LastEventTime ? moment(item.LastEventTime).format('DD/MM/YYYY') + ": " : ''}
          </span>
          <span className='font-wt-500'>
            {item.LastEventType ? item.LastEventType + "-" : ''}
          </span>
          <span className='font-wt-500' dangerouslySetInnerHTML={{ __html: item.LastNote ? item.LastNote.length > 60 ? item.LastNote.slice(0, 60) + "......." : item.LastNote : item.LAST_NOTE ? item.LAST_NOTE.length > 60 ? item.LAST_NOTE.slice(0, 60) + "......." : item.LAST_NOTE : '' }}>
          </span>
        </span>
        row[8] = <div className='d-flex flex-row justify-content-between gap-3'>
          <div class="dropdown w-100" >
            <img src='assets/images/call_icon.svg' id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false" className='cursor' height={20} width={20} onClick={() => setSelectedExpIndex(index)} />
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton2">
              <div className=''>
                {createTaskDD.map((element, i) => {
                  return <div className={`d-flex flex-row gap-2 align-items-center p-2 ${element.label != 'Mark as Lost' ? 'border-bottom' : ''} `} onClick={() => tasksAction(i, item, index)}>
                    <img src={`assets/images/${element.img}`} title={element.name} className='cursor' />
                    <label className='font-size-12 mb-0'>{element.label}</label>
                  </div>
                })}
              </div>
            </ul>
          </div>
        </div>
        if (item.type_id == 20 && item.CPStatus != 3) {
          row[99] = <p className="font-size-12 text-color-value ml-3">
            <img src={"assets/images/warning.png"} alt="info" className="me-1" /> <span className=" mr-2  font-size-13"><b>
              New Channel partner signed up.</b><span className='ml-2 text-color1 text-decoration-underline cursor font-wt-600 font-size-13' onClick={() => {
                setViewDetails({
                  isVisible: true,
                  type: "Channel Partner",
                  data: {
                    type_id: item.type_id,
                    id: item.userId,
                    email_id: item.email_id,
                    company_name: item.company_name,
                    ...item
                  }
                })
              }}>Send an agreement </span> </span>
          </p>
        } else if (days) {
          row[99] = <p className="font-size-12 text-color-value ml-3 ">
            <img src={"assets/images/warning.png"} alt="info" className="me-1" /> <span className=" mr-2  font-size-13 colorFE4141">
              No Action Taken! </span>
          </p>
        }
        // if (!item.buyers_credit) {
        //   row[99] = <p className="font-size-12 text-color-value ml-3">
        //     <img src={"assets/images/warning.png"} alt="info" className="me-1" /> <span className=" mr-2"><b>
        //       Application sent by supplier, waiting for quote from financier</b> </span>
        //   </p>
        // }

        // if (item.termSheet && !item.termSheetSignedByExporter) {
        //   row[99] = <p className="font-size-12 text-color-value ml-3">
        //     <img src={"assets/images/warning.png"} alt="info" className="me-1" /> <span className=" mr-2"><b>
        //       Term sheet sent by financier</b> </span>
        //   </p>
        // }
        tableData.push(row)
        row = []
      } catch (e) {
        console.log('error in', e, item);
      }

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

  const AssignUsersInBulkV2 = (assingeeId, assignedIdSec) => {
    let exporterArr = []
    for (let i = 0; i <= selectedIndex.length - 1; i++) {
      const index = selectedIndex[i]
      exporterArr.push(overalldata[index].userId)
    }
    let reqObj = {
      USER_IDS: exporterArr,
      LeadAssignedTo: assingeeId,
      SecondaryLeadAssignedTo: assignedIdSec
    }
    setshowLoader(true)
    console.log('API REQ', reqObj);
    call('POST', 'AssignUsersInBulkV2', reqObj).then(result => {
      toastDisplay(result, "success")
      setshowLoader(false)
      getTasks()
      setshowdropdown(false)
    }).catch(e => {
      setshowLoader(false)
      toastDisplay(e, "error")
    })
  }

  return (

    <div className={renderAsChildren ? "" : "container-fluid"}>
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      <SubAdminPopup togglesubadminpopup={togglesubadminPopup} subadminpopup={subadminPopup} setshowLoader={setshowLoader} refreshtable={getTasks} />
      {showdropdown &&
        <FinanceInvoiceModal limitinvoice={showdropdown} headerTitle={''} modalSize={"sm"} closeSuccess={() => {
          setshowdropdown(false)
        }}>
          <div className='text-center'>
            <label className='w-100 font-size-14 font-wt-500 ml-2'>{`Assign Subadmin`}</label>

            <label className='text-left w-100 font-size-14 font-wt-500 ml-2'>{`Data Count : ${selectedIndex.length}`}</label>
            <div className='d-flex flex-row align-items-center mt-3 justify-content-center' >
              <div className='d-flex flex-row px-2' onClick={() => {
                setAssignmentType('Single')
                setdata({
                  ...data,
                  leadAssignedTo: null,
                  leadAssignedToSec: null
                })
              }}>
                <input className="form-check-input" type="radio" value={"Single"} checked={assignmentType === 'Single'} />
                <label className="form-check-label p-0 m-0" >
                  Single
                </label>
              </div>
              <div className='d-flex flex-row px-2' onClick={() => {
                setAssignmentType('Multiple')
                setdata({
                  ...data,
                  leadAssignedTo: null,
                  leadAssignedToSec: null
                })
              }}>
                <input className="form-check-input" type="radio" value={"Multiple"} checked={assignmentType === 'Multiple'} />
                <label className="form-check-label p-0 m-0" >
                  Multiple
                </label>
              </div>
            </div>
            <div className='col-md-12 mt-4'>
              <NewSelect
                selectData={salesPerson}
                optionLabel={'contact_person'} optionValue={'id'}
                name={"leadAssignedTo"} label={assignmentType === 'Multiple' ? 'Select Primary Admin' : 'Select Admin'} value={data.leadAssignedTo}
                onChange={handleChange} error={errors.leadAssignedTo}
              />
            </div>

            {assignmentType === 'Multiple' &&
              <div className='col-md-12 mt-4'>
                <NewSelect
                  selectData={salesPerson}
                  optionLabel={'contact_person'} optionValue={'id'}
                  name={"leadAssignedToSec"} label={assignmentType === 'Multiple' ? 'Select Secondary Admin' : 'Select Admin'} value={data.leadAssignedToSec}
                  onChange={handleChange} error={errors.leadAssignedToSec}
                />
              </div>
            }
            <button type="button"
              onClick={() => {
                if (selectedIndex.length > 0) {
                  if (data.leadAssignedTo) {
                    AssignUsersInBulkV2(data.leadAssignedTo, data.leadAssignedToSec)
                  } else {
                    toastDisplay("Select sub admin", "info")
                  }
                } else {
                  toastDisplay("Select at least one exporter to assign task", "info")
                }
              }}
              className={`new-btn w-60 py-2 px-3 text-white`}>
              {"Assign Users"}
            </button>
          </div>
        </FinanceInvoiceModal>
      }
      {emailPopup.show &&
        <SendEmailPopup emailPopup={emailPopup} toggleemailPopup={toggleemailPopup} CurrentEmailIds={CurrentEmailIds} userId={userId} CurrentOverallEmailIds={CurrentOverallEmailIds} setCurrentOverallEmailIds={setCurrentOverallEmailIds} setCurrentEmailIds={setCurrentEmailIds} type={"TRF Admin"} EXPORTER_CODE={emailPopup.data.userId} EXPORTER_NAME={emailPopup.data.company_name} userName={userTokenDetails?.userName} />
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
                  let req = { leadNote: notePopup.data }
                  if (!temp?.hasOwnProperty("buyers_credit")) {
                    req["userTblId"] = temp.userId
                  }
                  else if (temp?.finance_type === "invoice_discounting") {
                    req["invoiceLimitId"] = temp.id
                  }
                  else {
                    req["lcNo"] = temp.id
                  }
                  call('POST', 'addNoteForLead', req).then(res => {
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
              <button className={` new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => updateUserOnboardTask('Create New Task', null)}>Save Task</button>
              {/* <button className={` new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => { updateUserOnboardTask('Lead Created', null) }}>Add to Lead</button>
              <p className='font-size-16 text-color1 font-wt-600 mb-0 text-decoration-underline cursor' onClick={() => {
                setcloseLeadPopup(true)
                setcloseEventName('')
              }}>Close lead</p> */}
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
              <button className={` new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => updateUserOnboardTask('Didnt connect', isOpenDidntRec.selectedIndex)}>Save Task</button>
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
              <button className={` new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => updateUserOnboardTask('Call back', isOpenCallback.selectedIndex)}>Save Task</button>
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
              <button className={` new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => updateUserOnboardTask('Not Interested', isOpenNotInt.selectedIndex)}>Save Task</button>
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
              <button className={`new-btn-reject2 py-2 px-3 text-color-E74C3C cursor`} onClick={() => updateUserOnboardTask('Lead Lost', isOpenLost.selectedIndex)}>Save Task</button>
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
          <SideBarV2 state={"taskManagerUsers"} userTokenDetails={userTokenDetails} /> : null}
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
              }} userTokenDetails={userTokenDetails} />
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
              {!renderAsChildren && <>

                <div className='row mt-4'>
                  <div className='w-30 pl-0'>
                    <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                      <label className='w-100 font-size-14 text-color-value font-wt-600 pt-2 text-left'>{`New User - `}
                        <label className='font-size-14 text-color-value font-wt-600 text-custom2'>{statsdata.newUsersCount || 0}</label></label>
                      <div className='row px-0 w-100'>
                        <div className='w-50 cursor'
                          onClick={() => {
                            let temp = filterData
                            temp["New User Type"]["data"][0]["isChecked"] = true
                            temp["New User Type"]["data"][1]["isChecked"] = false
                            temp["New User Type"]["isFilterActive"] = true
                            setFilterData({ ...temp })
                          }}>
                          <label className={`value font-wt-600  w-100 cursor`}>
                            {statsdata.impexpCount || 0}
                          </label>
                          <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"Exporter/Importers"}</label>
                        </div>

                        <div className='w-50 cursor'
                          onClick={() => {
                            let temp = filterData
                            temp["New User Type"]["data"][0]["isChecked"] = false
                            temp["New User Type"]["data"][1]["isChecked"] = true
                            temp["New User Type"]["isFilterActive"] = true
                            setFilterData({ ...temp })
                          }}>
                          <label className={`value font-wt-600 w-100 cursor`}>
                            {statsdata.CPCount || 0}
                          </label>
                          <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"Channel Partner"}</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='w-20'>
                    <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                      <label className='w-100 font-size-14 text-color-value font-wt-600 pt-2 text-left'>{`Leads - `}
                        <label className='font-size-14 text-color-value font-wt-600 text-custom2'>{statsdata.leadsAssignedCount || 0}</label></label>
                      <label className={`w-100  value font-wt-600 text-custom2 text-left`}>
                        {statsdata.leadsNotAssignedCount || 0}
                      </label>
                      <label
                        onClick={() => {
                          let temp = filterData
                          temp["Lead Assignment Status"]["data"][1]["isChecked"] = true
                          temp["Lead Assignment Status"]["data"][0]["isChecked"] = false
                          temp["Lead Assignment Status"]["isFilterActive"] = true
                          setFilterData({ ...temp })
                        }}
                        className={'w-100 font-size-14 font-wt-700 text-color-value text-left cursor'}>{"Leads not assigned"}</label>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      let temp = filterData
                      for (let index = 0; index < temp["Lead Status"]["data"].length; index++) {
                        const element = temp["Lead Status"]["data"][index];
                        if (element.name === "Agreement Not Sent") {
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
                        {statsdata.AgreementPending || 0}
                      </label>
                      <label className={'w-100 font-size-14 font-wt-700 text-color-value text-left'}>{"Agreement not sent"}</label>
                    </div>
                  </div>
                </div>
              </>}
              <div className="filter-div ml-0 mt-1">
                <Filter
                  filteredSearch={filteredSearch}
                  setFilteredSearch={setFilteredSearch}
                  filterData={changedFilterData || filterData} setFilterData={setChangedFilterData || setFilterData} showFilterBtn={true}
                  showResultPerPage={true} count={count} filter={filter} setFilter={setFilter} refresh={refresh} setRefresh={setRefresh} showDownloadIcon={true} onDownloadClick={() => getTasks(true)} />
              </div>

              <div className="mb-3">
                <NewTable
                  //columns={Shipmentcolumns} 
                  filteredSearch={filteredSearch}
                  setFilteredSearch={setFilteredSearch}
                  tableFixed data={dbData}
                  columns={[
                    {
                      name: "Company Name", filter: true, filterDataKey: "Company Name", sort: [
                        { name: "Sort A-Z", selected: filter.sortCompanyName === "ASC", onActionClick: () => { setFilter({ ...filter, sortCompanyName: 'ASC', sortContactPerson: false, sortContactNo: false, sortLeadAssignedTo: false, sortByPeriod: false, }); setRefresh(refresh + 1) } },
                        { name: "Sort Z-A", selected: filter.sortCompanyName === "DESC", onActionClick: () => { setFilter({ ...filter, sortCompanyName: "DESC", sortContactPerson: false, sortContactNo: false, sortLeadAssignedTo: false, sortByPeriod: false, }); setRefresh(refresh + 1) } }]
                    },
                    {
                      name: "Contact Person", filter: true, filterDataKey: "Contact Person", sort: [
                        { name: "Sort A-Z", selected: filter.sortContactPerson === "ASC", onActionClick: () => { setFilter({ ...filter, sortContactPerson: 'ASC', sortCompanyName: false, sortContactNo: false, sortLeadAssignedTo: false, sortByPeriod: false, }); setRefresh(refresh + 1) } },
                        { name: "Sort Z-A", selected: filter.sortContactPerson === "DESC", onActionClick: () => { setFilter({ ...filter, sortContactPerson: "DESC", sortCompanyName: false, sortContactNo: false, sortLeadAssignedTo: false, sortByPeriod: false, }); setRefresh(refresh + 1) } }]
                    },
                    {
                      name: "Contact No", filter: true, filterDataKey: "Contact No"
                    },
                    {
                      name: "User Type", filter: true, filterDataKey: "New User Type"
                    },
                    {
                      name: "Lead Assigned", filter: true, filterDataKey: "Lead Assigned To", sort: [
                        { name: "Sort A-Z", selected: filter.sortLeadAssignedTo === "ASC", onActionClick: () => { setFilter({ ...filter, sortLeadAssignedTo: 'ASC', sortContactPerson: false, sortCompanyName: false, sortContactNo: false, sortByPeriod: false, }); setRefresh(refresh + 1) } },
                        { name: "Sort Z-A", selected: filter.sortLeadAssignedTo === "DESC", onActionClick: () => { setFilter({ ...filter, sortLeadAssignedTo: "DESC", sortContactPerson: false, sortCompanyName: false, sortContactNo: false, sortByPeriod: false, }); setRefresh(refresh + 1) } }]
                    },
                    {
                      name: "Period", filter: true, filterDataKey: "Period", sort: [
                        { name: "Sort A-Z", selected: filter.sortByPeriod === "ASC", onActionClick: () => { setFilter({ ...filter, sortByPeriod: 'ASC', sortContactPerson: false, sortCompanyName: false, sortContactNo: false, sortLeadAssignedTo: false, }); setRefresh(refresh + 1) } },
                        { name: "Sort Z-A", selected: filter.sortByPeriod === "DESC", onActionClick: () => { setFilter({ ...filter, sortByPeriod: "DESC", sortContactPerson: false, sortCompanyName: false, sortContactNo: false, sortLeadAssignedTo: false, }); setRefresh(refresh + 1) } }]
                    },
                    {
                      name: "Status"
                    },
                    {
                      name: 'Last Note'
                    },
                    {
                      name: ""
                    }
                  ]}
                  options={[
                    {
                      name: "Add Note", icon: "", onClick: (index) => {
                        let temp = overalldata[index]
                        toggleNotePopup({ show: true, data: temp.invoiceLimitLeadNote || temp.lcLimitLeadNote || temp.leadNote, selectedIndex: index, noteFor: temp.contact_person })
                      }
                    },
                    {
                      name: "View Application", icon: "", onClick: (index) => {
                        const tabledata = dbData[index]
                        let status = tabledata[7].props.children
                        const item = overalldata[index]
                        console.log('Itemmmmm', status)

                        if ((status === 'New User' || status === 'Agreement Pending') && item.type_id == 20) {
                          setViewDetails({
                            isVisible: true,
                            type: "Channel Partner",
                            data: {
                              type_id: item.type_id,
                              id: item.userId,
                              email_id: item.email_id,
                              company_name: item.company_name,
                              ...item
                            }
                          })
                        }
                        else if ((status === 'New User' || status === 'Limit Denied' || status === 'Buyer Not added') && item.type_id == 19) {
                          setViewDetails({
                            isVisible: true,
                            type: "Exporter",
                            data: {
                              type_id: item.type_id,
                              id: item.userId,
                              email_id: item.email_id,
                              company_name: item.company_name,
                              ...item
                            }
                          })
                        }
                        else {
                          handleOpeningApplication(index, 0)
                        }
                      }
                    },
                    {
                      name: "Send Mail", icon: "", onClick: (index) => {
                        const item = overalldata[index]
                        let noteFor = overalldata[index]?.company_name
                        toggleemailPopup({ data: item, show: true, selectedIndex: index, emailFor: noteFor })
                        setCurrentOverallEmailIds([{ "Email ID": item.email_id }])
                        setCurrentEmailIds([{ "Email ID": item.email_id }])
                      }

                    },
                  ]}
                  filterData={filterData}
                  setFilterData={setFilterData}
                />

              </div>
              <Pagination page={page} totalCount={count} onPageChange={(p) => setPage(p)} perPage={filter.resultPerPage || 10} />
            </>
          }
          {(hideGraphs || viewDetails.isVisible) ? null : (
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
                        <div className='text-center h-90'>
                          <img src='/assets/images/Active users application stage.png' width={"70%"} height={"90%"} />
                        </div>
                        <label className='position-absolute font-size-16 font-wt-700 appstage-fl'>{graphData?.activeApplicationStageFunnelGraphData[0]?.value}</label>
                        <label className='position-absolute font-size-16 font-wt-700 appstage-qts'>{graphData?.activeApplicationStageFunnelGraphData[1]?.value}</label>
                        <label className='position-absolute font-size-16 font-wt-700 appstage-ts'>{graphData?.activeApplicationStageFunnelGraphData[2]?.value}</label>
                        <label className='position-absolute font-size-16 font-wt-700 appstage-fin'>{graphData?.activeApplicationStageFunnelGraphData[3]?.value}</label>
                        <label className='position-absolute font-size-16 font-wt-700 appstage-agree'>{graphData?.activeApplicationStageFunnelGraphData[4]?.value}</label>
                        <label className='position-absolute font-size-16 font-wt-700 appstage-approved'>{graphData?.activeApplicationStageFunnelGraphData[5]?.value}</label>

                      </>
                    ) : null}
                    <label className='text-color-value font-size-14 font-wt-600 w-100 text-center mt-3'>Active Users (Application Stage)</label>
                  </div>

                  <div className='col-6'>
                    {graphData?.inactiveUserDaysFunnelGraphData?.length ? (
                      <>
                        <div className='text-center h-90'>
                          <img src='/assets/images/inactive days.png' width={"70%"} height={"80%"} />
                        </div>
                        <label className='position-absolute font-size-16 font-wt-700 inact-15-days'>{graphData?.inactiveUserDaysFunnelGraphData[0]?.value}</label>
                        <label className='position-absolute font-size-16 font-wt-700 inact-30-days'>{graphData?.inactiveUserDaysFunnelGraphData[1]?.value}</label>
                        <label className='position-absolute font-size-16 font-wt-700 inact-45-days'>{graphData?.inactiveUserDaysFunnelGraphData[2]?.value}</label>
                        <label className='position-absolute font-size-16 font-wt-700 inact-60-days'>{graphData?.inactiveUserDaysFunnelGraphData[3]?.value}</label>
                        <label className='position-absolute font-size-16 font-wt-700 inact-75-days'>{graphData?.inactiveUserDaysFunnelGraphData[4]?.value}</label>

                      </>
                    ) : null}
                    <label className='text-color-value font-size-14 font-wt-600 w-100 text-center mt-3'>Inactive Users (Days)</label>
                  </div>
                </div>
              )}
            </div>
          )}

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
    </div >
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
export default connect(mapStateToProps, null)(TaskManager) 