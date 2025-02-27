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
import { ExportExcel, addDaysSkipSundays, getContactObject, getInitials, insertObjectInArray, isEmpty } from '../../utils/myFunctions'
import { CustomSelect, InputWithSelect, NewInput, NewSelect, NewTextArea } from '../../utils/newInput'
import { Area, AreaChart, Bar, BarChart, Funnel, Legend, Line, FunnelChart, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import PieChartComponent from '../Reports/components/PieChartComponent'
import { ExpandableTable } from '../wallet/components/ExpandableTable'
import BottomPopup from './BottomPopup'
import { reminders } from '../chatRoom/components/calenderView'
import FinanceInvoiceModal from '../InvoiceDiscounting/contract/components/financeinvoiceModal'
import axios from 'axios'
import { platformBackendUrl } from '../../urlConstants'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';
import { useRef } from 'react'
import MultipleSelect from '../../utils/MultipleSelect'
import DropdownMenu from './DropDownMenu'
import SendEmailPopup from './SendEmailPopup'

// const salesPerson = [
//   "Nishi",
//   "Fiza",
//   "Manju",
//   "Dhruvi"
// ]

const requirements = [
  { name: "Export LC discounting" },
  { name: "Export LC confirmation" },
  { name: "Import LC discounting" },
  { name: "Export invoice discounting" },
  { name: "SBLC" },
  { name: "Supply chain finance" },
  { name: "Import factoring" },
  { name: "Usance at sight" },
  { name: "Freight finance" },
  { name: "Packing credit" },
  { name: "Purchase order financing   " },
  { name: "Reverse factoring" },
  { name: "Trade credit insurance" }
]

const shipmentdetails = [
  { "name": "Date", val: "DATE", type: 'date' },
  { "name": "Amount", val: "FOB_VALUE_USD", unit: "$", type: 'amount' },
  { "name": "Location", val: "DESTINATION_PORT" },
  { "name": "Buyer", val: "CONSIGNEE_NAME" }

]
const EventsArr = [
  { name: "Hot", val: 'Hot (30 days or less)' },
  { name: "Cold", val: 'Cold (60 days or more)' },
  { name: "Warm", val: 'Warm (30-60 days)' }
]


const LogsArr = [
  { name: "Task", val: 'Create New Task', color: 'color3DB16F' },
  { name: "Didn't Connect", val: 'Didnt connect', color: 'text-color1' },
  { name: "Call back", val: 'Call back', color: 'textFFB801' },
  { name: "Not Intrested", val: 'Not Interested', color: 'colorFE4141' },
  { name: 'Lost', val: 'Lead Lost', color: 'text-secondary' }
]
const CallList = ({ userTokenDetails, navToggleState, renderAsChildren, hideGraphs, showForThisUser, changedFilterData, setChangedFilterData }) => {

  let todayDateObj = moment()
  let lastMonthDateObj = moment().subtract("1", "months")
  const [data, setdata] = useState({})
  const [errors, setErrors] = useState({})
  const [refresh, setRefresh] = useState(0)
  const [filter, setFilter] = useState({ resultPerPage: 10 })
  const [filterData, setFilterData] = useState({})
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [dbData, setdbData] = useState([])
  const [contactsPopup, togglecontactsPopup] = useState({ show: false, data: [], EXPORTER_CODE: '' })
  const [countriesPopup, togglecountriesPopup] = useState({ show: false, data: [] })
  const [showLoader, setshowLoader] = useState(false)
  const [viewDetails, setViewDetails] = useState({
    type: '',
    isVisible: false,
    data: {}
  })
  const [callHistoryPopup, toggleCallHistoryPopup] = useState({ show: false, data: [] })
  const [includedStatus, setIncludedStatus] = useState([0, 1, 2, 3])
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
  const [filteredSearch, setFilteredSearch] = useState([])
  const [graphData, setGraphData] = useState({})
  const [tableExpand, setTableExpand] = useState("");
  const [expandedData, setExapndedData] = useState([]);
  const userPermissionsForSubAdmin = JSON.parse(userTokenDetails.UserAccessPermission || "{}")
  const userId = userTokenDetails?.user_id
  const userName = userTokenDetails?.userName

  const [activeIndex, setActiveIndex] = useState(0);
  const [EventStatus, setEventStatus] = useState(EventsArr)
  const [LogStatus, setLogStatus] = useState(LogsArr)

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
  const SubMenu = [
    {
      name: "Select",
      action: () => applyTaskTypeFilter("Select")
    },
    {
      name: "Task",
      action: () => applyTaskTypeFilter("Task")

    },
    {
      name: "Didnt't Connect",
      branchedMenus: [
        { name: "Busy", action: () => applyTaskTypeFilter("Busy") },
        { name: "Not Reachable", action: () => applyTaskTypeFilter("Not Reachable") },
        { name: "Wrong Number", action: () => applyTaskTypeFilter("Wrong Number") },
        { name: "Invalid Number", action: () => applyTaskTypeFilter("Invalid Number") },
        { name: "Switched Off", action: () => applyTaskTypeFilter("Switched Off") },
      ]
    },
    {
      name: "Call back",
      action: () => applyTaskTypeFilter("Call back")
    },
    {
      name: "Not Interested",
      action: () => applyTaskTypeFilter("Not Interested")

    },
    {
      name: "Lead Lost", action: () => applyTaskTypeFilter("Lead Lost")
    },
    {
      name: "User Onboarded", action: () => applyTaskTypeFilter("User Onboarded")
    }
  ]
  const [taskUpdate, settaskUpdate] = useState('Select')
  const [searchedLocation, setSearchedLocation] = useState([])
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [])

  const handleOutsideClick = (event) => {
    let eventTargetStr = event?.target?.outerHTML
    if (box && box.current && !box.current.contains(event.target)) {
      setshowCalendar(false)
    }
  }
  const [isMinimized, setISMinimized] = useState(false)
  const [closeLeadPopup, setcloseLeadPopup] = useState(false)
  const [closeEventName, setcloseEventName] = useState('')
  const [addmoreContacts, setAddMoreContacts] = useState(false)
  const [countrydata, setCountrydata] = useState([])
  const [isEditContact, setIsEditContact] = useState({
    isEdit: false,
    _id: ""
  })
  const [selectedDateFilter, setselectedDateFilter] = useState('Today')
  const [showCalendar, setshowCalendar] = useState(false)
  const [value, setValue] = useState({
    startDate: new Date(),
    endDate: new Date().setMonth(11)
  });
  const [taskType, setTaskType] = useState('Task Wise')
  const [onlyShowForUserId, setonlyShowForUserId] = useState((userPermissionsForSubAdmin?.mainAdmin || userPermissionsForSubAdmin?.[`Task Manager Call List Complete`]) ? undefined : userId)
  const [search, setSearch] = useState('')
  const box = useRef(null)
  const [CurrentOverallEmailIds, setCurrentOverallEmailIds] = useState([])
  const [CurrentEmailIds, setCurrentEmailIds] = useState([])
  const [showMailTemplates, setshowMailTemplates] = useState({
    show: false,
    templates: []
  })
  const [selectedTemplate, setselectedTemplate] = useState(null)
  const [viewCommentsPopup, setviewCommentsPopup] = useState({ show: false, data: [], selectedIndex: null, noteFor: "" })
  const [emailPopup, toggleemailPopup] = useState({ show: false, data: {}, selectedIndex: null, emailFor: "" })
  const [toggle, setToggle] = useState("Live")
  const handleMultiSelectchange = (e, name, val, singleSelect) => {
    if (singleSelect) {
      setdata({
        ...data,
        [name]: e?.[0]?.[val] ? e.reverse()?.[0]?.[val] : null
      })
    }
    else {
      if (e?.[0]?.id === "temp") {
        let allcontactdata = CurrentOverallEmailIds
        allcontactdata.push({ ...e[0], [val]: e[0]["typedInput"], id: e[0]["typedInput"] })
        setCurrentOverallEmailIds(allcontactdata)
        setCurrentEmailIds(allcontactdata)
        console.log('temppppppppppp', e, data[name]);
        setdata({
          ...data,
          [name]: data[name] ? data[name].concat([e[0]["typedInput"]]) : [e[0]["typedInput"]]
        })
      } else {
        console.log('temppppppppppp2', e, data[name]);
        setdata({
          ...data,
          [name]: Array.isArray(e) ? e.map((x) => x[val]) : []
        });
      }
    }
  };
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

  const handleAccordianClick = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };
  useEffect(() => {
    // let isCacheExist = localStorage.getItem('taskManagerFilterData') != "{}"
    // if (!isCacheExist) {
    setshowLoader(true)
    let objectAPI = {
      ...filter,
      included_status: includedStatus,
    }
    if (onlyShowForUserId) {
      objectAPI["onlyShowForUserId"] = userId
    }
    // for (let index = 0; index < Object.keys(filterData || {}).length; index++) {
    //   let filterName = Object.keys(filterData)[index]
    //   const element = filterData[filterName];
    //   if (element.isFilterActive) {
    //     if (element.type === "checkbox") {
    //       objectAPI[element.accordianId] = []
    //       element["data"].forEach((i) => {
    //         if (i.isChecked) {
    //           objectAPI[element.accordianId].push(i[element["labelName"]])
    //         }
    //       })
    //     }
    //     else if (element.type === "minMaxDate") {
    //       objectAPI[element.accordianId] = element["value"]
    //     } else if (element.type === 'singleDate') {
    //       objectAPI[element.accordianId] = element["value"]
    //     }
    //   }
    // }
    call('POST', 'getCallListFilters', objectAPI).then(res => {
      console.log("getCallListFilters then", res);
      setFilterData(res)
      setFilteredSearch(res)
    }).catch(err => { })
    axios.get(platformBackendUrl + "/getallCountry").then((result) => {
      if (result.data.message && result.data.message.length) {
        setCountrydata(result.data.message);
      }
    });
    // }
  }, [])
  const handleChange = async (event) => {

    if (event.persist) {
      event.persist()
    }
    if (event.target.name === "contact_number") {
      const selectedExporter = overalldata[selectedExpIndex]?.EXTRA_DETAILS
      if (selectedExporter) {
        const findContactObj = selectedExporter.find(item => item["Contact Number"] === event.target.value)
        setdata({
          ...data,
          "contact_number": event.target.value,
          "contact_person": findContactObj["Contact Person"]
        })
        setErrors({ ...errors, [event.target.name]: "" })
      }
    } else if (event.target.name === "contact_person") {
      const selectedExporter = overalldata[selectedExpIndex]?.EXTRA_DETAILS
      if (selectedExporter) {
        const findContactObj = selectedExporter.find(item => item["Contact Person"] === event.target.value)
        setdata({
          ...data,
          "contact_person": event.target.value,
          "contact_number": findContactObj["Contact Number"]
        })
        setErrors({ ...errors, [event.target.name]: "" })
      }
    } else {
      setdata({ ...data, [event.target.name]: event.target.value })
      setErrors({ ...errors, [event.target.name]: "" })
    }

  }
  useEffect(() => {
    if (!onlyShowForUserId) {
      setshowLoader(true)
      call("POST", 'getSubAdminUser', {}).then(res => {
        setshowLoader(false)
        setSalesPerson(res.data)
      }).catch(err => setshowLoader(false))
    } else {
      setshowLoader(true)
      call("POST", 'getSubAdminUser', { parentId: onlyShowForUserId }).then(res => {
        setshowLoader(false)
        setSalesPerson(res.data)
      }).catch(err => setshowLoader(false))
    }
  }, [])
  const getTasks = (isDownload) => {
    if (!isDownload) {
      setshowLoader(true)
    } else {
      toastDisplay("Download Started....", "info")
    }
    let objectAPI = {
      currentPage: page,
      ...filter,
      resultPerPage: filter.resultPerPage,
      included_status: toggle === 'Live' ? [0, 1, 2] : [0, 1, 2, 3, 4],
    }
    if (isDownload) {
      delete objectAPI["currentPage"]
      delete objectAPI["resultPerPage"]
    }
    if (onlyShowForUserId) {
      objectAPI["onlyShowForUserId"] = userId
    }
    for (let index = 0; index < Object.keys(filterData || {}).length; index++) {
      let filterName = Object.keys(filterData)[index]
      const element = filterData[filterName];
      if (element.isFilterActive) {
        if (element.type === "checkbox") {
          objectAPI[element.accordianId] = []
          element["data"].forEach((i) => {
            if (i.isChecked) {
              objectAPI[element.accordianId].push(i[element["labelName"]])
            }
          })
        }
        else if (element.type === "minMaxDate") {
          objectAPI[element.accordianId] = element["value"]
        } else if (element.type === 'singleDate') {
          objectAPI[element.accordianId] = element["value"]
        }
      }
    }
    objectAPI['taskType'] = 'Call List'
    if (data.subadmins) {
      delete objectAPI["onlyShowForUserId"]
      objectAPI["leadAssignedTo"] = data.subadmins
    }
    if (selectedDateFilter == 'Overall') {
      delete objectAPI["dateRangeFilter"]
    }
    if ((selectedDateFilter !== 'Overall' && objectAPI["dateRangeFilter"]) || selectedDateFilter == 'Overall' && !objectAPI["dateRangeFilter"]) {
      if (filter.search) {
        delete objectAPI["dateRangeFilter"]
      }
      call('POST', toggle === 'Live' ? 'getAdminTasks' : 'getAdminHistoryTasks', objectAPI)
        .then((result) => {
          if (isDownload) {
            let finaldata = []
            console.log('SalesPersoon', salesPerson)
            downLoadMasterdata(result.message)
            setshowLoader(false)
          } else {
            setdbData(formatDataForTable(result.message))
            setCount(result.total_count)
            setoveralldata(result.message)
            setshowLoader(false)
          }

        }).catch(e => {
          console.log('error in api res', e);
          setshowLoader(false)
        })
    }

  }
  const downLoadMasterdata = (downloaddata) => {
    let finaldata = []
    for (let i = 0; i <= downloaddata.length - 1; i++) {
      const firstExporter = downloaddata[i]
      let exportObj = {
        SR_NO: i + 1,
        EXPORTER_CODE: firstExporter?.EXPORTER_CODE,
        EXPORTER_NAME: firstExporter?.EXPORTER_NAME || "",
        EXPORTER_ADDRESS: firstExporter?.EXPORTER_ADDRESS || "",
        EXPORTER_CITY: firstExporter.EXPORTER_CITY,
        FOB: firstExporter?.FOB_BY_HS ? firstExporter?.FOB_BY_HS : firstExporter?.FOB,
        'Last Updated At': firstExporter.LastEventTime ? moment(firstExporter.LastEventTime).format('DD/MM/YYYY') : '',
        'Last Updated Status': firstExporter.LastEventType ? firstExporter.LastEventType : '',
        'Last Note': firstExporter.LastNote ? firstExporter.LastNote : firstExporter.LAST_NOTE ? firstExporter.LAST_NOTE : ''

      }
      if (firstExporter?.EXTRA_DETAILS?.[0]) {
        const extra_obj = firstExporter?.EXTRA_DETAILS?.[0]
        exportObj = {
          ...exportObj,
          Department: extra_obj["Department"] || "",
          "Contact Person": extra_obj["Contact Person"] || "",
          Designation: extra_obj["Designation"] || "",
          DIN: extra_obj["DIN"] || "",
          "GST/ Establishment Number": extra_obj["GST/ Establishment Number"] || "",
          "Contact Number": extra_obj["Contact Number"] || "",
          "Email ID": extra_obj["Email ID"] || ""
        }
      }
      finaldata.push(exportObj)
      if (firstExporter?.EXTRA_DETAILS?.length) {
        const EXTRA_DETAILS = firstExporter?.EXTRA_DETAILS
        for (let j = 1; j <= EXTRA_DETAILS.length - 1; j++) {
          let extra_obj = EXTRA_DETAILS[j]
          let exportObj = {
            SR_NO: "",
            EXPORTER_CODE: "",
            EXPORTER_NAME: "",
            EXPORTER_ADDRESS: "",
            EXPORTER_CITY: "",
            FOB: "",
            'Last Updated At': "",
            "Last Updated Status": "",
            "Last Note": "",
            Department: extra_obj["Department"] || "",
            "Contact Person": extra_obj["Contact Person"] || "",
            Designation: extra_obj["Designation"] || "",
            DIN: extra_obj["DIN"] || "",
            "GST/ Establishment Number": extra_obj["GST/ Establishment Number"] || "",
            "Contact Number": extra_obj["Contact Number"] || "",
            "Email ID": extra_obj["Email ID"] || ""
          }
          finaldata.push(exportObj)

        }
      }
    }
    ExportExcel(finaldata, "CallList" + new Date().getTime())
  }
  useEffect(() => {
    setdbData(formatDataForTable(overalldata))
  }, [onlyShowForUserId, overalldata])
  const getTasksStats = () => {
    setshowLoader(true)
    let objectAPI = {
      currentPage: page,
      ...filter,
      resultPerPage: filter.resultPerPage,
      included_status: [0, 1, 2, 3, 4],
      taskType
    }
    if (onlyShowForUserId) {
      objectAPI["onlyShowForUserId"] = userId
    }

    for (let index = 0; index < Object.keys(filterData || {}).length; index++) {
      let filterName = Object.keys(filterData)[index]
      const element = filterData[filterName];
      if (element.isFilterActive) {
        if (element.type === "checkbox") {
          objectAPI[element.accordianId] = []
          element["data"].forEach((i) => {
            if (i.isChecked) {
              objectAPI[element.accordianId].push(i[element["labelName"]])
            }
          })
        }
        else if (element.type === "minMaxDate") {
          objectAPI[element.accordianId] = element["value"]
        } else if (element.type === 'singleDate') {
          objectAPI[element.accordianId] = element["value"]
        }
      }
    }
    if (data.subadmins) {
      delete objectAPI["onlyShowForUserId"]
      objectAPI["leadAssignedTo"] = data.subadmins
    }
    if (selectedDateFilter == 'Overall') {
      delete objectAPI["dateRangeFilter"]
    }
    if ((selectedDateFilter !== 'Overall' && objectAPI["dateRangeFilter"]) || selectedDateFilter == 'Overall' && !objectAPI["dateRangeFilter"]) {
      call('POST', 'getCallListStatsV2', objectAPI).then(result => {
        console.log('resulttttt', result);
        //setstatsdata(result)
        let eventStatusArr = []
        for (let i = 0; i <= EventStatus.length - 1; i++) {
          const element = EventStatus[i]
          const matcheddata = result?.eventResponse?.find(item => item.EVENT_TYPE === element.val)
          element["count"] = matcheddata ? matcheddata.total_records : 0
          eventStatusArr.push(element)
        }
        let LogStatusArr = []
        for (let i = 0; i <= LogStatus.length - 1; i++) {
          const element = LogStatus[i]
          const matcheddata = result?.logsResponse?.find(item => item.LOG_TYPE === element.val)
          element["count"] = matcheddata ? matcheddata.total_records : 0
          LogStatusArr.push(element)
        }
        setEventStatus(eventStatusArr)
        setLogStatus(LogStatusArr)
        setstatsdata({
          leadsCount: result?.leadsCount,
          onboardCount: result?.onboardCount,
          pendingCount: result?.pendingCount,
          completedCount: result?.completedCount,
          newTaskCount: result?.newTaskCount,
          FollowupCount: result?.FollowupCount,
          totalCount: (result?.newTaskCount || 0) + (result?.FollowupCount || 0)
        })
        setshowLoader(false)

      }).catch(e => {
        setshowLoader(false)

      })
    }

  }
  useEffect(() => {
    getTasks()
  }, [page, refresh, salesPerson, filterData, includedStatus, toggle])
  useEffect(() => {
    getTasksStats()
  }, [filterData, taskType])
  useEffect(() => {
    if (data.subadmins) {
      getTasks()
      getTasksStats()
      setonlyShowForUserId(undefined)
    } else {
      setonlyShowForUserId((userPermissionsForSubAdmin?.mainAdmin || userPermissionsForSubAdmin?.[`Task Manager Call List Complete`]) ? undefined : userId)
    }
  }, [data.subadmins])
  async function handlecontactsPopup(itemData) {
    setshowLoader(true)
    console.log("getTransactionHistoryForLC api resp====>", itemData);
    setshowLoader(false)
    togglecontactsPopup({ show: true, data: itemData.EXTRA_DETAILS, EXPORTER_CODE: itemData.EXPORTER_CODE })
  }

  async function handleCountriesPOPUP(itemData) {
    setshowLoader(true)
    let apiResp = await call('POST', 'getTopCountries', {
      EXPORTER_NAME: itemData.EXPORTER_NAME,
      EXPORTER_COUNTRY: itemData.EXPORTER_COUNTRY
    })
    // console.log("getTransactionHistoryForInvoiceLimit api resp====>", itemData, apiResp);
    setshowLoader(false)
    togglecountriesPopup({ show: true, data: apiResp })
  }

  async function handleCallHistoryPopup(itemData) {
    setshowLoader(true)
    let apiResp = await call('POST', 'getCRMCallHistory', {
      EXPORTER_CODE: itemData.EXPORTER_CODE
    })
    // console.log("getTransactionHistoryForInvoiceLimit api resp====>", itemData, apiResp);
    setshowLoader(false)
    toggleCallHistoryPopup({ show: true, data: apiResp })
  }

  const updateLeadAssignedTo = (leadAssignedName, id) => {
    call('POST', 'updateEnquiryLeadAssignedTo', { leadAssignedName, id }).then(result => {
      toastDisplay("Lead updated", "success")
      getTasks()
    }).catch(e => {
      toastDisplay("Failed to assign lead to " + leadAssignedName, "error")
    })
  }

  const getExpComment = async (itemData, index) => {
    try {
      setshowLoader(true)
      const result = await call('POST', 'getExpComment', { EXPORTER_CODE: itemData.EXPORTER_CODE })
      setviewCommentsPopup({ show: true, data: result, selectedIndex: index })
      setshowLoader(false)
    } catch (e) {
      setshowLoader(false)
    }
  }

  useEffect(() => {
    let startDate
    let endDate
    const today = new Date();
    if (selectedDateFilter === 'Today') {
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, -1);
    } else if (selectedDateFilter === 'Previous Week') {
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    } else if (selectedDateFilter === 'Previous Month') {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (selectedDateFilter === 'Current Week') {
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()));
    } else if (selectedDateFilter === 'Current Month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (selectedDateFilter === 'Custom') {
      setshowCalendar(true)
      return
    } else if (selectedDateFilter === 'Yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
    } else if (selectedDateFilter === 'Overall') {
      startDate = new Date(2020, 1, 1);
      endDate = new Date(today.getFullYear() + 1, today.getMonth() + 1, 0);
    }
    if (selectedDateFilter === 'Overall') {
      let temp = filterData
      if (temp["Date"]) {
        temp["Date"]["value"] = []
        temp["Date"]["isFilterActive"] = true
        setFilterData({ ...temp })
        setRefresh(refresh + 1)
      }
    } else {
      let temp = filterData
      if (temp["Date"]) {
        temp["Date"]["value"][0] = moment(startDate).format('YYYY-MM-DD')
        temp["Date"]["value"][1] = moment(endDate).format('YYYY-MM-DD')
        temp["Date"]["isFilterActive"] = true
        setFilterData({ ...temp })
        setRefresh(refresh + 1)
      }
    }


  }, [selectedDateFilter])
  function formatDataForTable(data) {
    let tableData = []
    let row = []
    let countriesObj = {
      'UNITED STATES OF AMERICA': 'USA',
      'UNITED ARAB EMIRATES': 'UAE',
      'UNITED KINGDOM': 'UK'
    }
    data.forEach((item, index) => {
      let mappedData = getContactObject(item.EXTRA_DETAILS ? item.EXTRA_DETAILS : [])
      row.push(<span className={`${item.STATUS === 4 ? 'color-2ECC71' : ''} cursor`} onClick={() => {
        if (item.STATUS === 4) {
          setshowLoader(true)
          call('POST', 'getExporterByTTVCode', { ttvExporterCode: item.EXPORTER_CODE }).then(result => {
            setshowLoader(false)
            //window.location = '/masterdataProfile'
            localStorage.setItem('exporterDetails', JSON.stringify({
              isVisible: true,
              data: result,
              isOnboarded: true
            }))
            window.open('/masterdataProfile', '_blank')
          }).catch(e => {
            setshowLoader(false)
            //window.location = '/masterdataProfile'
            localStorage.setItem('exporterDetails', JSON.stringify({
              isVisible: true,
              data: item,
              isOnboarded: false
            }))
            window.open('/masterdataProfile', '_blank')
          })
        } else {
          //window.location = '/masterdataProfile'
          localStorage.setItem('exporterDetails', JSON.stringify({
            isVisible: true,
            data: item,
            isOnboarded: false
          }))
          window.open('/masterdataProfile', '_blank')
        }
      }} >{item.EXPORTER_NAME}</span>)
      row.push(mappedData ? mappedData['Contact Person'] ? mappedData['Contact Person'] : 'NA' : 'NA')
      row.push(mappedData ? mappedData['Department'] ? mappedData['Department'] : 'NA' : 'NA')
      row.push(<div onClick={() => handlecontactsPopup(item)} className='cursor'>
        {mappedData ? mappedData['Contact Number'] ? mappedData['Contact Number'] : 'NA' : 'NA'}
      </div>)
      row.push(item.FOB ? "$ " + Intl.NumberFormat("en", { notation: 'compact' }).format(item.FOB) : '')
      row.push(<ul className='py-0 pl-3 cursor' onClick={() => handleCountriesPOPUP(item)} >
        {item?.TOP_COUNTRIES?.slice(0, 2)?.map(item => {
          return <li >
            <div className='font-size-12'>
              {item.destination_country ? countriesObj[item.destination_country] ? countriesObj[item.destination_country] : item.destination_country : '-'}
            </div>
          </li>
        })}
      </ul>)
      if (!onlyShowForUserId) {
        row.push(<label class="font-wt-500 font-size-13 cursor">
          {item.TASK_ASSIGNED_TO?.[0]?.contact_person || '-'}
        </label>)
      }
      row.push(<span className='cursor' onClick={() => handleCallHistoryPopup(item)}>
        <span className='font-wt-600'>
          {item.LastEventTime ? moment(item.LastEventTime).format('DD/MM/YYYY') + ": " : ''}
        </span>
        <span className='font-wt-600'>
          {item.LastEventType ? item.LastEventType + "-" : ''}
        </span>
        <span className='font-wt-500' dangerouslySetInnerHTML={{ __html: item.LastNote ? item.LastNote.length > 60 ? item.LastNote.slice(0, 60) + "......." : item.LastNote : item.LAST_NOTE ? item.LAST_NOTE.length > 60 ? item.LAST_NOTE.slice(0, 60) + "......." : item.LAST_NOTE : '' }}>
        </span>
      </span>)
      row.push(<div className='d-flex flex-row justify-content-between gap-3' onClick={() => setSelectedExpIndex(index)}>
        <img src='assets/images/createTask.svg' title='Create New Task' className='cursor' onClick={() => {
          // Step 1: Group the array by HS_CODES
          const groupedArray = item?.HS_CODES?.reduce((groups, obj) => {
            const { HS_CODES } = obj;
            const firstTwoDigits = HS_CODES.substring(0, 2);

            if (!groups[firstTwoDigits]) {
              groups[firstTwoDigits] = [];
            }

            groups[firstTwoDigits].push(obj);
            return groups;
          }, {});

          // Step 2: Extract the first two digits as keys
          const keys = Object.keys(groupedArray);
          const result = keys.map(key => ({ HS_CODE: key }));
          console.log(result);
          const days = addDaysSkipSundays(new Date(), 2)
          const todaysdata = moment().format("HH:mm")
          item["HS_2_DIGIT"] = result
          setdata({
            ...data,
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
        }} />
        <img src='assets/images/didntconnect.svg' title="Call Didn't Connect" className='cursor' onClick={() => {
          let days
          let todaystime = moment().format("HH:mm")
          if ((item.DidntConnectCount === 0 || item.DidntConnectCount === 1) && (moment().format("HH") < 10)) {
            todaystime = moment().add(4, 'hours').format("HH:mm")
          } else if ((item.DidntConnectCount === 0 || item.DidntConnectCount === 1) && (moment().format("HH") > 10)) {
            days = addDaysSkipSundays(new Date(), 1)
          } else if (item.DidntConnectCount === 2) {
            days = addDaysSkipSundays(new Date(), 2)
          } else if (item.DidntConnectCount === 3) {
            days = addDaysSkipSundays(new Date(), 3)
          } else if (item.DidntConnectCount === 4) {
            days = addDaysSkipSundays(new Date(), 4)
          } else if (item.DidntConnectCount === 5) {
            days = addDaysSkipSundays(new Date(), 5)
          } else {
            days = addDaysSkipSundays(new Date(), 7)
          }
          setdata({
            ...data,
            event_status: "Busy",
            event_date: moment(days).format('YYYY-MM-DD'),
            event_time: todaystime,
            assignedTo: userTokenDetails?.user_id
          })
          setisOpenDidntRec({
            isVisible: true,
            selectedIndex: index
          })
        }} />
        <img src='assets/images/callback.svg' title='Call back requested' className='cursor' onClick={() => {
          let days
          let todaystime = moment().add(5, "hours").format('HH:mm')
          if (moment().format("HH") < 14) {
            todaystime = moment().add(4, 'hours').format("HH:mm")
            days = new Date()
          } else {
            days = addDaysSkipSundays(new Date(), 1)
          }
          let todaysdate = moment(days).format('YYYY-MM-DD')
          setdata({
            ...data,
            event_status: "Busy",
            event_date: todaysdate,
            event_time: todaystime,
            reminder: "30 minutes",
            assignedTo: userTokenDetails?.user_id
          })
          setisOpenCallback({
            isVisible: true,
            selectedIndex: index
          })
        }} />
        <img src='assets/images/not_intrested.svg' title='Not Interested' className='cursor' onClick={() => {
          let nextday = addDaysSkipSundays(new Date(), 7)
          const days = moment(nextday).format('YYYY-MM-DD')
          const todaysdata = moment(nextday).format('HH:mm')
          setdata({
            ...data,
            event_status: "Busy",
            event_date: days,
            event_time: todaysdata,
            assignedTo: userTokenDetails?.user_id
          })
          setisOpenNotInt({
            isVisible: true,
            selectedIndex: index
          })
        }} />
        <img src='assets/images/marked_as_lost.svg' title='Marked as Lost Lead' className='cursor' onClick={() => {
          setdata({
            ...data,
            assignedTo: userTokenDetails?.user_id
          })
          setisOpenLost({
            isVisible: true,
            selectedIndex: index
          })
        }} />
      </div>)

      tableData.push(row)
      row = []
    })
    return tableData
  }
  const expandedTable = (data, id, EXPORTER_NAME) => {
    console.log('getExporterExtraDetails', data);
    setshowLoader(true)
    call('POST', 'getExporterExtraDetails', { EXPORTER_NAME: data.EXPORTER_NAME, EXPORTER_COUNTRY: data.EXPORTER_COUNTRY }).then(result => {
      setExapndedData([{
        ...data,
        ...result
      }])
      setshowLoader(false)
      setTableExpand(id);
    }).catch(e => {
      setshowLoader(false)
    })

  }

  const updateCRMTask = (LOG_TYPE, index, type) => {
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
        ASSIGN_TASK_TO: {
          id: assignedObj.id,
          contact_person: assignedObj.contact_person,
          name_title: assignedObj.name_title,
          designation: assignedObj.designation,
          email_id: assignedObj.email_id
        },
        INTRESTED_SERVICES: data.exportServices,
        SELECTED_HS: data.expHSNCode,
        CONTACT_PERSON: data.contact_person,
        CONTACT_NUMBER: data.contact_number,
        LOG_TYPE,
        LOST_REASON: type === 'closed' ? "Lead Not interested" : data.reasonForLost,
        MEETING_LOCATION: data.meetLocation,
        MEETING_DURATION: data.meetdurationInHrs,
        MEETING_HEAD_COUNT: data.noOfPerson,
        ADMIN_ID: userId,
        ADMIN_NAME: userName
      }
      if (LOG_TYPE === 'Create New Task' || LOG_TYPE === 'Lead Created' || type === 'closed') {
        reqObj["EXPORTER_CODE"] = expandedData[0]?.EXPORTER_CODE
        reqObj["EXPORTER_NAME"] = expandedData[0]?.EXPORTER_NAME
      } else {
        reqObj["EXPORTER_CODE"] = overalldata[index]?.EXPORTER_CODE
        reqObj["EXPORTER_NAME"] = overalldata[index]?.EXPORTER_NAME
      }
      call('POST', 'updateCRMTask', reqObj).then(result => {
        toastDisplay(result, 'success')
        setshowLoader(false)
        handleClose()
        getTasks()
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
  useEffect(() => {
    if (isOpen.isVisible) {
      console.log('data', isOpen);
      expandedTable(isOpen?.data, isOpen.data?.EXPORTER_NAME, isOpen.data?.EXPORTER_CODE)
    } else {
      expandedTableFN()
    }
  }, [isOpen])
  const expandedTableFN = () => {
    setTableExpand("");
    setExapndedData([]);
    //handleClose()
  }
  const applyTaskTypeFilter = (value) => {
    let temp = filterData
    console.log('Tempppppppppp', temp);
    const filterIndex = temp["Task Update"]["data"].findIndex(item => item.name === value)
    for (let i = 0; i <= temp["Task Update"]["data"].length - 1; i++) {
      if (i === filterIndex) {
        temp["Task Update"]["data"][filterIndex]["isChecked"] = true
      } else {
        temp["Task Update"]["data"][i]["isChecked"] = false
      }
    }
    temp["Task Update"]["isAllChecked"] = false
    let isFilterActive = false
    for (let index = 0; index < temp["Task Update"]["data"].length; index++) {
      const element = temp["Task Update"]["data"][index];
      if (element.isChecked) {
        isFilterActive = true
      }
    }
    temp["Task Update"]["isFilterActive"] = isFilterActive
    setFilterData({ ...temp })
    setRefresh(refresh + 1)
    settaskUpdate(value)
  }
  const addExtraContactDetails = () => {
    let errors = {}
    if (!data.department && !data.contactPerson && !data.designation && !data.contactNo && !data.email_id) {
      errors.department = 'Department cannot be empty'
      errors.contactPerson = 'Contact Person cannot be empty'
      errors.designation = 'Designation Cannot be empty'
      errors.contactNo = 'Contact Number cannot be empty'
      errors.email_id = 'Email ID Cannot be empty'
    }
    if (!isEmpty(errors)) {
      setErrors(errors)
    } else {
      setshowLoader(true)
      let reqObj = {
        EXPORTER_CODE: contactsPopup.EXPORTER_CODE,
        isUpdate: isEditContact.isEdit,
        contactObject: {
          "Department": data.department,
          "Contact Person": data.contactPerson,
          "Designation": data.designation,
          "Contact Number": data.contactNo,
          "Email ID": data.email_id,
          "isPrimary": data.primaryDetails,
          "_id": isEditContact._id
        }
      }
      call('POST', 'addExtraContactDetails', reqObj).then(result => {
        toastDisplay(result, "success")
        setshowLoader(false)
        setAddMoreContacts(false)
        togglecontactsPopup({ data: [], show: false, EXPORTER_CODE: '' })
        setdata({
          ...data,
          contactNo: "",
          contactPerson: "",
          department: "",
          designation: "",
          email_id: ""
        })
        getTasks()
      }).catch(e => {
        toastDisplay(e, "error")
        setshowLoader(false)
      })
    }
  }

  return (

    <div className={renderAsChildren ? "" : "container-fluid"}>
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      {closeLeadPopup && <FinanceInvoiceModal headerTitle={'Close Task'} isCentered={true} limitinvoice={closeLeadPopup} closeSuccess={() => setcloseLeadPopup(false)}>
        <>
          <div className='d-flex align-items-center flex-column'>
            <div className='text-center col-md-5 mt-3'>
              <div className='d-flex flex-row px-2' onClick={() => setcloseEventName('User Onboarded')}>
                <input className="form-check-input" type="radio" value={"User Onboarded"} checked={closeEventName === 'User Onboarded'} />
                <label className="form-check-label p-0 m-0" >
                  User Onboarded
                </label>
              </div>
            </div>

            <div className='text-center col-md-5 mt-3'>
              <div className='d-flex flex-row px-2' onClick={() => setcloseEventName('Lead Lost')}>
                <input className="form-check-input" type="radio" value={"Lead Lost"} checked={closeEventName === 'Lead Lost'} />
                <label className="form-check-label p-0 m-0" >
                  Lead Lost
                </label>
              </div>
            </div>
          </div>

          <button className={` new-btn py-2 mt-4 px-4 text-white cursor`} onClick={() => closeEventName === '' ? toastDisplay("Type Not Selected", "info") : updateCRMTask(closeEventName, null, 'closed')}>Close Task</button>

        </>
      </FinanceInvoiceModal>}
      <div className={`modal fade ${addmoreContacts && "show"}`} style={addmoreContacts ? { display: "block", "zIndex": '1000001' } : {}}>
        <div className="modal-dialog modal-md  modal-dialog-centered">
          <div className="modal-content submitmodal pb-4"
          >
            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <div className='d-flex gap-3 align-items-center'>
                  <label
                    className="font-size-14 font-wt-500 text-color-value mx-3 mb-0"
                  >{`Add New Contact`}</label>
                  <img src='assets/images/delete.png' />
                </div>

                <div className="modal-header border-0">
                  <img src='assets/images/close-schedule.png' className='cursor' onClick={() => {
                    setAddMoreContacts(false)
                    setdata({
                      ...data,
                      contactNo: "",
                      contactPerson: "",
                      department: "",
                      designation: "",
                      email_id: ""
                    })
                    setIsEditContact({
                      isEdit: false,
                      _id: ''
                    })
                  }} />
                </div>
              </div>
            </div>
            <div className="modal-body px-4">
              <div className='col-md-12 d-flex align-items-center flex-column'>
                <div className="col-md-10 pt-1 ">
                  <div className="col-md-11 px-0">
                    <NewInput
                      isAstrix={true}
                      type={"text"}
                      label={"Contact Person Name"}
                      name={"contactPerson"}
                      value={data.contactPerson}
                      onChange={handleChange}
                      error={errors.contactPerson}
                    />
                  </div>
                </div>
                <div className="col-md-10 pt-1 ">
                  <div className="col-md-11 px-0">
                    <NewInput
                      isAstrix={true}
                      type={"text"}
                      label={"Designation"}
                      name={"designation"}
                      value={data.designation}
                      onChange={handleChange}
                      error={errors.designation}
                    />
                  </div>
                </div>
                <div className="col-md-10 pt-1 ">
                  <div className="col-md-11 px-0">
                    <NewInput
                      isAstrix={true}
                      type={"text"}
                      label={"Department"}
                      name={"department"}
                      value={data.department}
                      onChange={handleChange}
                      error={errors.department}
                    />
                  </div>
                </div>
                <div className="col-md-10 pt-1 ">
                  <div className="col-md-11 px-0">
                    <InputWithSelect
                      selectData={countrydata} selectName={"phoneCode"} selectValue={data.phoneCode} optionLabel={"phonecode"}
                      optionValue={'phonecode'}
                      type="number" name={"contactNo"} value={data["contactNo"]}
                      onChange={handleChange}
                      label={"Conatct No."} error={errors["contactNo"]} />
                  </div>
                </div>
                <div className="col-md-10 pt-1 ">
                  <div className="col-md-11 px-0">
                    <NewInput
                      isAstrix={true}
                      type={"text"}
                      label={"Email ID"}
                      name={"email_id"}
                      value={data.email_id}
                      onChange={handleChange}
                      error={errors.email_id}
                    />
                  </div>
                </div>
                <div className='col-md-10 mt-2 '>
                  <img
                    onClick={() => setdata({ ...data, primaryDetails: !data.primaryDetails })}
                    className='cursor mr-3' src={`assets/images/${data.primaryDetails ? 'checked-green' : 'empty-check'}.png`} />
                  <label>Select as primary contact</label>
                </div>
                <div className='col-md-10 pt-1 '>
                  <button onClick={addExtraContactDetails} className={`mt-3 new-btn  py-2 px-2 text-white cursor`}>Save Contact</button>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
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
                  let req = {
                    COMMENT: notePopup.data,
                    EXPORTER_CODE: temp.EXPORTER_CODE,
                    EXPORTER_NAME: temp.EXPORTER_NAME,
                    SUB_ADMIN_USER_ID: userTokenDetails?.user_id,
                    SUBADMIN_NAME: userTokenDetails?.userName
                  }
                  call('POST', 'addCRMExpComment', req).then(res => {
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

      <div className={`modal fade ${contactsPopup.show && "show"}`} style={contactsPopup.show ? { display: "block", "zIndex": '100001' } : {}}>
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal p-0"
          >

            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label
                  className="font-size-16 font-wt-600 text-color-value mx-3"
                >Contact Details</label>
                <div className="modal-header border-0">
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => togglecontactsPopup({ show: false, data: [], EXPORTER_CODE: '' })}></button>
                </div>
              </div>
            </div>

            <div className="modal-body p-0 ">
              <div className='px-4'>
                {contactsPopup.data.length ? contactsPopup.data.map((item, index) => {
                  return (
                    <div className='d-flex flex-row ml-3'>
                      <div className="progressBarContainer">
                        <div className="progressBarInnerCircle">
                        </div>
                      </div>
                      <div className='pl-4 pt-3'>
                        <div className='w-100 d-flex justify-content-between align-items-center'>
                          <p className='font-size-14 text-color1 font-wt-500 mb-0'>
                            {item['Contact Person'] ? item['Contact Person'] : 'NA'}
                            {item.Department && <span className='font-size-14 text-color-label font-wt-500 mb-0'>{` (${item.Department}) `}</span>}
                          </p>
                          <img src='assets/images/edit-icon.png' className='cursor ml-4' onClick={() => {
                            setdata({
                              ...data,
                              contactNo: item["Contact Number"],
                              contactPerson: item["Contact Person"],
                              department: item["Department"],
                              designation: item["Designation"],
                              email_id: item["Email ID"]
                            })
                            setAddMoreContacts(true)
                            setIsEditContact({
                              isEdit: true,
                              _id: item._id
                            })
                          }} />
                        </div>
                        {item.Designation &&
                          <p className='font-size-14 text-color1 font-wt-500 mb-0'>
                            {item.Designation}
                          </p>
                        }
                        <p className='font-size-14 text-color-label font-wt-500 mb-0 cursor' onClick={() => {
                          if (item['Contact Number']) {
                            window.open(`tel:${item['Contact Number']}`, '_top');
                          }

                        }}>{item['Contact Number'] ? item['Contact Number'] : '-'}
                          <img src='assets/images/call-vector.png' className='ml-3' />

                        </p>
                      </div>
                    </div>
                  )
                }) :
                  null}
              </div>
              <button className={`new-btn-r-0 w-100 mt-4 py-2 px-2 text-white cursor`} onClick={() => setAddMoreContacts(true)}>Add Contact Details</button>

            </div>

          </div>
        </div>
      </div>

      <div className={`modal fade ${countriesPopup.show && "show"}`} style={countriesPopup.show ? { display: "block", "zIndex": '100001' } : {}}>
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal pb-4"
          >

            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label
                  className="font-size-16 font-wt-600 text-color-value mx-3"
                >Top Countries BY FOB</label>
                <div className="modal-header border-0">
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => togglecountriesPopup({ show: false, data: [] })}></button>
                </div>
              </div>
            </div>

            <div className="modal-body px-4">
              {countriesPopup.data.length ? countriesPopup.data.map((item, index) => {
                return (
                  <div className='d-flex flex-row ml-3'>
                    <div className="progressBarContainer2">
                      <div className="progressBarInnerCircle">
                      </div>
                    </div>
                    <div className='pl-4 pt-4 mt-2'>
                      <p className='font-size-14 text-color1 font-wt-500 mb-0'>
                        {item['_id'] ? item['_id'] : 'NA'}
                        <span className='font-size-14 text-color-label font-wt-500 mb-0'>{` ${item.total_shipments} `}</span>
                        <span><img src='assets/images/arrow.png' className='cursor' onClick={() => handleAccordianClick(index)} /></span>
                      </p>
                      {activeIndex === index &&
                        <div>
                          <p className='mb-0 font-size-14'>Buyers</p>
                          <ol type="1" className='py-0 pl-3 cursor' onClick={() => handleCountriesPOPUP(item)} style={{ listStyle: 'decimal' }}>
                            {item?.top_buyers?.map(item => {
                              return <li >
                                <div className='font-size-14'>
                                  {item.buyer_name + " - " + item.shipment_count}
                                </div>
                              </li>
                            })}
                          </ol>
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
                          <p className='mb-0'>
                            {item.CONTACT_PERSON && <span className='mb-0 font-size-14 font-wt-600'>{item.CONTACT_PERSON + " - "}</span>}
                            {item.CONTACT_NUMBER && <span className='mb-0 font-size-14 font-wt-600'>{item.CONTACT_NUMBER}</span>}
                          </p>
                          <p className='mb-0'>
                            {item.EVENT_TIME &&
                              <span className='mb-0 font-size-14 '>Next followup date:
                                <span className='mb-0 font-size-14 '>
                                  {moment(item.EVENT_TIME).format('DD/MM/YYYY')}
                                </span>
                              </span>
                            }
                          </p>

                          <p>
                            {item.ADMIN_NAME &&
                              <span className='mb-0 font-size-14 '>Created By:
                                <span className='mb-0 font-size-14 '>
                                  {item.ADMIN_NAME}
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

      <div className={`modal fade ${viewCommentsPopup.show && "show"}`} style={viewCommentsPopup.show ? { display: "block", "zIndex": '100001' } : {}}>
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal p-0"
          >

            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label
                  className="font-size-16 font-wt-600 text-color-value mx-3"
                >Comments</label>
                <div className="modal-header border-0">
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setviewCommentsPopup({ show: false, data: [], EXPORTER_CODE: '' })}></button>
                </div>
              </div>
            </div>

            <div className="modal-body p-0 filterbody">
              <div className='px-4'>
                <div>
                  {viewCommentsPopup.data.map(ele => {
                    return <div className='p-2 border rounded my-4' >
                      <div className='d-flex justify-content-between'>
                        <label className='font-size-14 font-wt-600'>{ele.CREATED_BY} </label>
                        <label className='font-size-14 font-wt-600'>{moment(ele.CREATED_AT).format('DD/MM/YYYY    HH:mm A')} </label>
                      </div>
                      <div>
                        <p className='font-size-15 font-wt-400'>
                          {ele.COMMENT}
                        </p>
                      </div>
                    </div>
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {emailPopup.show &&
        <SendEmailPopup emailPopup={emailPopup} toggleemailPopup={toggleemailPopup} CurrentEmailIds={CurrentEmailIds} userId={userId} CurrentOverallEmailIds={CurrentOverallEmailIds} setCurrentOverallEmailIds={setCurrentOverallEmailIds} setCurrentEmailIds={setCurrentEmailIds} type={"TRF CRM"} EXPORTER_CODE={emailPopup.data.EXPORTER_CODE} EXPORTER_NAME={emailPopup.data.EXPORTER_NAME} userName={userTokenDetails?.userName} successHandler={getTasks} />
      }


      {isOpen.isVisible &&
        <BottomPopup isOpen={isOpen.isVisible} onClose={handleClose}>
          <div className='CreateNewTaskDiv'>
            <div className='d-flex flex-row align-items-center gap-3 justify-content-between'>
              {/* <p className='font-size-16 text-color1 font-wt-600 mb-0'>Create Task</p> */}
              <button className={` new-btn py-2 px-3 text-white cursor`} onClick={() => updateCRMTask('Create New Task', null)}>Save Task</button>
              <button className={isOpen.data.STATUS === 1 ? `new-btn-approved py-2 px-3 cursor` : `new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => {
                if (isOpen.data.status === 1) {
                  toastDisplay("Already Added to Lead", "info")
                } else {
                  updateCRMTask('Lead Created', null)
                }
              }}>{isOpen.data.STATUS === 1 ? 'Added to Lead' : 'Add to Lead'}</button>
              <p className='font-size-16 text-color1 font-wt-600 mb-0 text-decoration-underline cursor' onClick={() => {
                setcloseLeadPopup(true)
                setcloseEventName('')
              }}>Close lead</p>
              <img src='assets/images/arrow.png' className='cursor' onClick={() => setISMinimized(!isMinimized)} style={isMinimized ? { transform: "rotate(180deg)" } : {}} />
              <img src='assets/images/cross.png' className='cursor' onClick={handleClose} />
            </div>
            {!isMinimized &&
              <div>
                <div className='row  p-0 mt-4'>
                  <div className='col-md-6'>
                    <NewSelect
                      selectData={expandedData[0]?.EXTRA_DETAILS?.filter(item => item["Contact Person"]) || []}
                      optionLabel={'Contact Person'} optionValue={'Contact Person'}
                      name={"contact_person"} label={'Contact Person Name'}
                      value={data.contact_person || ""} onChange={handleChange} error={errors.contact_person}
                    />
                  </div>
                  <div className='col-md-6'>
                    <NewSelect
                      selectData={expandedData[0]?.EXTRA_DETAILS?.filter(item => item["Contact Number"]) || []}
                      optionLabel={'Contact Number'} optionValue={'Contact Number'}
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
                <div className='col-md-12 p-0'>
                  <MultipleSelect
                    Id="Select Requirement"
                    Label="Select Requirement"
                    selectedvalue="Select Requirement"
                    optiondata={requirements}
                    onChange={(e) => handleMultiSelectchange(e, "exportServices", "name")}
                    value={data.exportServices ? data.exportServices : []}
                    name="exportServices"
                    labelKey={"name"}
                    valKey={"name"}
                    customStyles={{
                      backgroundColor: '#DEF7FF',
                      borderRadius: '10px'
                    }}
                    isCheckableList={true}
                  />
                </div>
                <div className='col-md-12 p-0'>
                  <MultipleSelect
                    Id="HSN Code"
                    Label="HSN Code"
                    selectedvalue="HSN Code"
                    optiondata={isOpen.data?.HS_2_DIGIT || []}
                    onChange={(e) => handleMultiSelectchange(e, "expHSNCode", "HS_CODE")}
                    value={data.expHSNCode || []}
                    name="expHSNCode"
                    labelKey={"HS_CODE"}
                    valKey={"HS_CODE"}
                    customStyles={{
                      backgroundColor: '#DEF7FF',
                      borderRadius: '10px'
                    }}
                    isCheckableList={true}

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
              <button className={` new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => updateCRMTask('Didnt connect', isOpenDidntRec.selectedIndex)}>Save Task</button>
              <img src='assets/images/arrow.png' className='cursor' onClick={() => setISMinimized(!isMinimized)} style={isMinimized ? { transform: "rotate(180deg)" } : {}} />
              <img src='assets/images/cross.png' className='cursor' onClick={() => setisOpenDidntRec({ isVisible: false, selectedIndex: 0 })} />
            </div>
            {!isMinimized &&
              <div>
                <div className='row  p-0 mt-4'>
                  <div className='col-md-6'>
                    <NewSelect
                      selectData={overalldata[selectedExpIndex]?.EXTRA_DETAILS?.filter(item => item["Contact Person"]) || []}
                      optionLabel={'Contact Person'} optionValue={'Contact Person'}
                      name={"contact_person"} label={'Contact Person Name'}
                      value={data.contact_person || ""} onChange={handleChange} error={errors.contact_person}
                    />
                  </div>
                  <div className='col-md-6'>
                    <NewSelect
                      selectData={overalldata[selectedExpIndex]?.EXTRA_DETAILS?.filter(item => item["Contact Number"]) || []}
                      optionLabel={'Contact Number'} optionValue={'Contact Number'}
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
              <button className={` new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => updateCRMTask('Call back', isOpenCallback.selectedIndex)}>Save Task</button>
              <img src='assets/images/arrow.png' className='cursor' onClick={() => setISMinimized(!isMinimized)} style={isMinimized ? { transform: "rotate(180deg)" } : {}} />
              <img src='assets/images/cross.png' className='cursor' onClick={() => setisOpenCallback({ isVisible: false, selectedIndex: 0 })} />
            </div>
            {!isMinimized &&
              <div>
                <div className='row  p-0 mt-4'>
                  <div className='col-md-6'>
                    <NewSelect
                      selectData={overalldata[selectedExpIndex]?.EXTRA_DETAILS?.filter(item => item["Contact Person"]) || []}
                      optionLabel={'Contact Person'} optionValue={'Contact Person'}
                      name={"contact_person"} label={'Contact Person Name'}
                      value={data.contact_person || ""} onChange={handleChange} error={errors.contact_person}
                    />
                  </div>
                  <div className='col-md-6'>
                    <NewSelect
                      selectData={overalldata[selectedExpIndex]?.EXTRA_DETAILS?.filter(item => item["Contact Number"]) || []}
                      optionLabel={'Contact Number'} optionValue={'Contact Number'}
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
              <button className={` new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => updateCRMTask('Not Interested', isOpenNotInt.selectedIndex)}>Save Task</button>
              <img src='assets/images/arrow.png' className='cursor' onClick={() => setISMinimized(!isMinimized)} style={isMinimized ? { transform: "rotate(180deg)" } : {}} />
              <img src='assets/images/cross.png' className='cursor' onClick={() => setisOpenNotInt({ isVisible: false, selectedIndex: 0 })} />
            </div>
            {!isMinimized &&
              <div>
                <div className='row  p-0 mt-4'>
                  <div className='col-md-6'>
                    <NewSelect
                      selectData={overalldata[selectedExpIndex]?.EXTRA_DETAILS?.filter(item => item["Contact Person"]) || []}
                      optionLabel={'Contact Person'} optionValue={'Contact Person'}
                      name={"contact_person"} label={'Contact Person Name'}
                      value={data.contact_person || ""} onChange={handleChange} error={errors.contact_person}
                    />
                  </div>
                  <div className='col-md-6'>
                    <NewSelect
                      selectData={overalldata[selectedExpIndex]?.EXTRA_DETAILS?.filter(item => item["Contact Number"]) || []}
                      optionLabel={'Contact Number'} optionValue={'Contact Number'}
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
              <button className={`new-btn-reject2 py-2 px-3 text-color-E74C3C cursor`} onClick={() => updateCRMTask('Lead Lost', isOpenLost.selectedIndex)}>Save Task</button>
              <img src='assets/images/arrow.png' className='cursor' onClick={() => setISMinimized(!isMinimized)} style={isMinimized ? { transform: "rotate(180deg)" } : {}} />
              <img src='assets/images/cross.png' className='cursor' onClick={() => setisOpenLost({ isVisible: false, selectedIndex: 0 })} />
            </div>
            {!isMinimized &&
              <div>
                <div className='row  p-0 mt-4'>
                  <div className='col-md-6'>
                    <NewSelect
                      selectData={overalldata[selectedExpIndex]?.EXTRA_DETAILS?.filter(item => item["Contact Person"]) || []}
                      optionLabel={'Contact Person'} optionValue={'Contact Person'}
                      name={"contact_person"} label={'Contact Person Name'}
                      value={data.contact_person || ""} onChange={handleChange} error={errors.contact_person}
                    />
                  </div>
                  <div className='col-md-6'>
                    <NewSelect
                      selectData={overalldata[selectedExpIndex]?.EXTRA_DETAILS?.filter(item => item["Contact Number"]) || []}
                      optionLabel={'Contact Number'} optionValue={'Contact Number'}
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
          <SideBarV2 state={"taskManagerCallList"} userTokenDetails={userTokenDetails} /> : null}
        <main role="main" className={`ml-sm-auto col-lg-${renderAsChildren ? '12' : '10'} ` + (navToggleState.status ? " expanded-right" : "")} id="app-main-div">
          {!renderAsChildren ?
            <HeaderV2
              title={"Task Manager"}
              userTokenDetails={userTokenDetails} /> : null}

          {!viewDetails.isVisible &&
            <>
              <div className='row'>
                <div className='w-mob-50 w-14'>
                  <label>Date</label>
                  <CustomSelect
                    selectData={[{ name: "Overall" }, { name: 'Previous Month' }, { name: 'Previous Week' }, { name: 'Yesterday' }, { name: 'Today' }, { name: 'Current Week' }, { name: 'Current Month' }, { name: 'Custom' }]}
                    optionLabel={'name'} optionValue={'name'}
                    onItemCllick={(e) => {
                      console.log('onselecttttttt', e);
                      if (e === 'Custom') {
                        setselectedDateFilter(e)
                        setshowCalendar(true)

                      } else {
                        setselectedDateFilter(e)
                        setshowCalendar(false)
                      }

                    }}
                    value={selectedDateFilter}
                  />
                  {showCalendar &&
                    <div className='position-absolute dropdownZindex' ref={box}>
                      <Calendar onChange={(val) => {
                        let temp = filterData
                        if (temp["Date"]) {
                          temp["Date"]["value"][0] = moment(val[0]).format('YYYY-MM-DD')
                          temp["Date"]["value"][1] = moment(val[1]).format('YYYY-MM-DD')
                          temp["Date"]["isFilterActive"] = true
                          setFilterData({ ...temp })
                          setRefresh(refresh + 1)
                        }
                        setshowCalendar(false)
                      }}
                        //value={[new Date(filterData["Date"]["value"][0]), new Date(filterData["Date"]["value"][1])]}
                        className="borderRadius border-0 calenderBorder col-md-12"
                        next2Label={null}
                        rev2Label={null}
                        selectRange={true}
                        calendarType={"US"} />
                    </div>


                  }

                </div>
                <div className='w-mob-50 w-14'>
                  <label>Task Update</label>
                  {/* <NewSelect
                    // selectData={[{ "name": "Pending" }, { "name": "Not Interested" }, { "name": "Lost Leads" }]}
                    selectData={filterData?.["Task Update"]?.['data'] ? filterData["Task Update"]['data'] : []}
                    optionLabel={'name'} optionValue={'name'}
                    onChange={(e) => {
                      let temp = filterData
                      const filterIndex = temp["Task Update"]["data"].findIndex(item => item.name === e.target.value)
                      for (let i = 0; i <= temp["Task Update"]["data"].length - 1; i++) {
                        if (i === filterIndex) {
                          temp["Task Update"]["data"][filterIndex]["isChecked"] = true
                        } else {
                          temp["Task Update"]["data"][i]["isChecked"] = false
                        }
                      }
                      temp["Task Update"]["isAllChecked"] = false
                      let isFilterActive = false
                      for (let index = 0; index < temp["Task Update"]["data"].length; index++) {
                        const element = temp["Task Update"]["data"][index];
                        if (element.isChecked) {
                          isFilterActive = true
                        }
                      }
                      temp["Task Update"]["isFilterActive"] = isFilterActive
                      setFilterData({ ...temp })
                      setRefresh(refresh + 1)
                    }}
                  /> */}
                  <DropdownMenu
                    containerStyle={{
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid #95E7FF"
                    }}
                    navIndex={3}
                    title={taskUpdate}
                    isActive={false}
                    values={SubMenu} />
                </div>

                <div className='w-mob-50 w-14'>
                  <label>Task Type</label>
                  <NewSelect
                    selectData={[{ name: "Task Wise" }, { name: "Exporter Wise" }]}
                    optionLabel={'name'} optionValue={'name'} value={taskType}
                    onChange={(e) => {
                      setTaskType(e.target.value)
                    }}
                  />
                </div>
                <div className='w-mob-50 w-14'>
                  <label>Status</label>
                  <NewSelect
                    selectData={filterData?.["Status"]?.['data'] ? filterData["Status"]['data'] : []}
                    optionLabel={'name'} optionValue={'name'}
                    onChange={(e) => {
                      let temp = filterData
                      const filterIndex = temp["Status"]["data"].findIndex(item => item.name === e.target.value)
                      console.log('elenmenttssaas', filterIndex);
                      for (let i = 0; i <= temp["Status"]["data"].length - 1; i++) {
                        if (i === filterIndex) {
                          console.log('filterindex', i, filterIndex);
                          temp["Status"]["data"][filterIndex]["isChecked"] = true
                        } else {
                          temp["Status"]["data"][i]["isChecked"] = false
                        }
                      }
                      temp["Status"]["isAllChecked"] = false
                      let isFilterActive = false
                      for (let index = 0; index < temp["Status"]["data"].length; index++) {
                        const element = temp["Status"]["data"][index];
                        if (element.isChecked) {
                          isFilterActive = true
                        }
                      }
                      temp["Status"]["isFilterActive"] = isFilterActive
                      setFilterData({ ...temp })
                      setRefresh(refresh + 1)

                    }}
                  />
                </div>
                <div className='w-mob-50 w-14'>
                  <label>Requirement</label>
                  <NewSelect
                    selectData={filterData?.["Requirement"]?.['data'] ? filterData["Requirement"]['data'] : []}
                    optionLabel={'name'} optionValue={'name'}
                    onChange={(e) => {
                      let temp = filterData
                      const filterIndex = temp["Requirement"]["data"].findIndex(item => item.name === e.target.value)
                      console.log('elenmenttssaas', filterIndex);
                      for (let i = 0; i <= temp["Requirement"]["data"].length - 1; i++) {
                        if (i === filterIndex) {
                          temp["Requirement"]["data"][filterIndex]["isChecked"] = true
                        } else {
                          temp["Requirement"]["data"][i]["isChecked"] = false
                        }
                      }
                      temp["Requirement"]["isAllChecked"] = false
                      let isFilterActive = false
                      for (let index = 0; index < temp["Requirement"]["data"].length; index++) {
                        const element = temp["Requirement"]["data"][index];
                        if (element.isChecked) {
                          isFilterActive = true
                        }
                      }
                      temp["Requirement"]["isFilterActive"] = isFilterActive
                      setFilterData({ ...temp })
                      setRefresh(refresh + 1)
                    }}
                  />
                </div>
                <div className='w-mob-50 w-14'>
                  <label>HSN Code</label>
                  <NewSelect
                    selectData={filterData?.["HS Code"]?.['data'] ? filterData["HS Code"]['data'] : []}
                    optionLabel={'name'} optionValue={'name'}
                    onChange={(e) => {
                      let temp = filterData
                      const filterIndex = temp["HS Code"]["data"].findIndex(item => item.name === e.target.value)
                      console.log('elenmenttssaas', filterIndex);
                      for (let i = 0; i <= temp["HS Code"]["data"].length - 1; i++) {
                        if (i === filterIndex) {
                          console.log('filterindex', i, filterIndex);
                          temp["HS Code"]["data"][filterIndex]["isChecked"] = true
                        } else {
                          temp["HS Code"]["data"][i]["isChecked"] = false
                        }
                      }
                      temp["HS Code"]["isAllChecked"] = false
                      let isFilterActive = false
                      for (let index = 0; index < temp["HS Code"]["data"].length; index++) {
                        const element = temp["HS Code"]["data"][index];
                        if (element.isChecked) {
                          isFilterActive = true
                        }
                      }
                      temp["HS Code"]["isFilterActive"] = isFilterActive
                      setFilterData({ ...temp })
                      setRefresh(refresh + 1)
                    }}
                  />
                </div>
                {userPermissionsForSubAdmin?.mainAdmin ?
                  <div className='w-mob-50 w-14'>
                    <label>Caller</label>
                    <NewSelect
                      selectData={filterData?.["Lead Assigned To"]?.['data'] ? filterData["Lead Assigned To"]['data'] : []}
                      optionLabel={'name'} optionValue={'name'}
                      onChange={(e) => {
                        let temp = filterData
                        const filterIndex = temp["Lead Assigned To"]["data"].findIndex(item => item.name === e.target.value)
                        console.log('elenmenttssaas', filterIndex);
                        for (let i = 0; i <= temp["Lead Assigned To"]["data"].length - 1; i++) {
                          if (i === filterIndex) {
                            console.log('filterindex', i, filterIndex);
                            temp["Lead Assigned To"]["data"][filterIndex]["isChecked"] = true
                          } else {
                            temp["Lead Assigned To"]["data"][i]["isChecked"] = false
                          }
                        }
                        temp["Lead Assigned To"]["isAllChecked"] = false
                        let isFilterActive = false
                        for (let index = 0; index < temp["Lead Assigned To"]["data"].length; index++) {
                          const element = temp["Lead Assigned To"]["data"][index];
                          if (element.isChecked) {
                            isFilterActive = true
                          }
                        }
                        temp["Lead Assigned To"]["isFilterActive"] = isFilterActive
                        setFilterData({ ...temp })
                        setRefresh(refresh + 1)
                      }}
                    />
                  </div>
                  :
                  <div className='w-mob-50 w-14'>
                    <label>Caller</label>
                    <MultipleSelect
                      Id="Select User"
                      Label="Select User"
                      selectedvalue="Select Requirement"
                      optiondata={salesPerson}
                      onChange={(e) => handleMultiSelectchange(e, "subadmins", "contact_person")}
                      value={data.subadmins ? data.subadmins : []}
                      name="subadmins"
                      labelKey={"contact_person"}
                      hideLabel={true}
                      valKey={"contact_person"}
                      customStyles={{
                        backgroundColor: '#DEF7FF',
                        borderRadius: '10px'
                      }}
                      isCheckableList={true}
                    />
                  </div>

                }
              </div>
              <div className='row mt-5'>
                <div className='w-20 w-mob-auto pl-0'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <label className='w-100 font-size-14 text-color-value font-wt-600 pt-2 text-left'>{`Total Task - `}
                      <label className='font-size-14 text-color-value font-wt-600 text-color1'>{statsdata.totalCount || 0}</label></label>
                    <div className='row px-0 w-100'>
                      <div className='w-50 cursor'
                        onClick={() => {
                          let temp = filterData
                          temp["Task Update"]["data"][0]["isChecked"] = true
                          temp["Task Update"]["data"][1]["isChecked"] = true
                          temp["Task Update"]["data"][2]["isChecked"] = false
                          temp["Task Update"]["data"][3]["isChecked"] = false
                          temp["Task Update"]["data"][4]["isChecked"] = false
                          temp["Task Update"]["data"][5]["isChecked"] = false
                          temp["Task Update"]["data"][6]["isChecked"] = false
                          temp["Task Update"]["data"][7]["isChecked"] = false
                          temp["Task Update"]["data"][8]["isChecked"] = false
                          temp["Task Update"]["data"][9]["isChecked"] = false
                          temp["Task Update"]["data"][10]["isChecked"] = false
                          temp["Task Update"]["isFilterActive"] = true
                          setFilterData({ ...temp })
                          setRefresh(refresh + 1)
                        }}>
                        <label className={`value font-wt-600  w-100 cursor`}>
                          {statsdata.FollowupCount || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"Follow Up"}</label>
                      </div>
                      <div className='w-50 cursor'
                        onClick={() => {
                          let temp = filterData
                          temp["Task"]["data"][0]["isChecked"] = false
                          temp["Task"]["data"][1]["isChecked"] = true
                          temp["Task"]["isFilterActive"] = true
                          setFilterData({ ...temp })
                          setRefresh(refresh + 1)
                        }}>
                        <label className={`value font-wt-600  w-100 cursor`}>
                          {statsdata.newTaskCount || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"New Task"}</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='w-20 w-mob-auto pl-0'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <div className='row px-0 w-100'>
                      <div className='w-50 cursor'
                        onClick={() => {
                          let temp = filterData
                          temp["Task"]["data"][0]["isChecked"] = true
                          temp["Task"]["data"][1]["isChecked"] = false
                          temp["Task"]["isFilterActive"] = true
                          setFilterData({ ...temp })
                          setRefresh(refresh + 1)
                        }}>
                        <label className={`value font-wt-600  color3DB16F w-100 cursor`}>
                          {statsdata.completedCount || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"Task Complete"}</label>
                      </div>
                      <div className='w-50 cursor'
                        onClick={() => {
                          let temp = filterData
                          temp["Task"]["data"][0]["isChecked"] = false
                          temp["Task"]["data"][1]["isChecked"] = true
                          temp["Task"]["isFilterActive"] = true
                          setFilterData({ ...temp })
                          setRefresh(refresh + 1)
                        }}>
                        <label className={`value font-wt-600  w-100  colorFE4141 cursor`}>
                          {statsdata.pendingCount || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"Task Incomplete"}</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='w-20 w-mob-auto pl-0'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <div className='row px-0 w-100'>
                      <div className='w-50 cursor'
                        onClick={() => {
                          let temp = filterData
                          console.log('filterdataaaaaa', temp)
                          temp["Leads"]["data"][0]["isChecked"] = true
                          temp["Leads"]["data"][1]["isChecked"] = false
                          temp["Leads"]["isFilterActive"] = true
                          setFilterData({ ...temp })
                          setRefresh(refresh + 1)
                        }}>
                        <label className={`value font-wt-600  w-100 cursor`}>
                          {statsdata.leadsCount || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"Lead"}</label>
                      </div>
                      <div className='w-50 cursor'
                        onClick={() => {
                          let temp = filterData
                          console.log('filterdataaaaaa', temp)
                          temp["Task Update"]["data"][0]["isChecked"] = false
                          temp["Task Update"]["data"][1]["isChecked"] = false
                          temp["Task Update"]["data"][2]["isChecked"] = false
                          temp["Task Update"]["data"][3]["isChecked"] = false
                          temp["Task Update"]["data"][4]["isChecked"] = false
                          temp["Task Update"]["data"][5]["isChecked"] = false
                          temp["Task Update"]["data"][6]["isChecked"] = false
                          temp["Task Update"]["data"][7]["isChecked"] = false
                          temp["Task Update"]["data"][8]["isChecked"] = false
                          temp["Task Update"]["data"][9]["isChecked"] = false
                          temp["Task Update"]["data"][10]["isChecked"] = true
                          temp["Task Update"]["isFilterActive"] = true
                          setFilterData({ ...temp })
                          setRefresh(refresh + 1)
                        }}>
                        <label className={`value font-wt-600  w-100 cursor`}>
                          {statsdata.onboardCount || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"Onboarded"}</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='w-40 w-mob-auto pl-0'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <div className='row px-0 w-100'>
                      {LogStatus.map((item, index) => {
                        return <div className='w-20 cursor'
                          onClick={() => {
                            let temp = filterData
                            console.log('filterdataaaaaa', temp)
                            temp["Task Update"]["data"][index >= 2 ? index + 5 : index]["isChecked"] = true
                            temp["Task Update"]["data"][5]["isChecked"] = false
                            for (let i = 0; i <= LogStatus.length - 1; i++) {
                              if (i !== index) {
                                temp["Task Update"]["data"][i >= 2 ? i + 5 : i]["isChecked"] = false
                              }
                            }
                            temp["Task Update"]["isFilterActive"] = true
                            setFilterData({ ...temp })
                            setRefresh(refresh + 1)
                          }}>
                          <label className={`value font-wt-600  w-100 cursor ${item.color}`}>
                            {item.count || 0}
                          </label>
                          <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{item.name}</label>
                        </div>
                      })}

                    </div>
                  </div>
                </div>
              </div>
              <div className="filter-div ml-0 mt-1">
                <Filter
                  filterData={changedFilterData || filterData} setFilterData={setChangedFilterData || setFilterData} showFilterBtn={true} showDownloadIcon={true}
                  showResultPerPage={true} count={count} filter={filter} setFilter={setFilter} refresh={refresh} setRefresh={setRefresh} onDownloadClick={() => getTasks(true)} resetPage={() => setPage(1)} setToggle={setToggle} toggleLabel1="Live" toggleLabel2="History" showToggleButton={true} />
              </div>

              <div className="mb-3">
                <ExpandableTable
                  refresh={refresh}
                  setRefresh={setRefresh}
                  filter={filter}
                  setFilter={setFilter}
                  filterKey={"TasksState"}
                  filterData={filterData}
                  setFilterData={setFilterData}
                  filteredSearch={filteredSearch}
                  setFilteredSearch={setFilteredSearch}
                  tableFixed data={dbData}
                  columns={onlyShowForUserId ? [
                    { name: "Company Name", filter: true, width: '14%', filterDataKey: "Company Name" },
                    { name: "Director Name", filter: true, width: '8%', filterDataKey: "Contact Person" },
                    { name: "Designation", filter: true, width: '10%', filterDataKey: "Designation" },
                    { name: "Contact Number", filter: true, width: '8%', filterDataKey: "Contact No" },
                    { name: "FOB", filter: true, width: '6%' },
                    { name: "Top Countries", filter: true, width: '8%' },
                    { name: "Last Note", filter: true, width: '20%', filterDataKey: "Task" },
                    { name: "Action", width: '13%' }
                  ] : [
                    { name: "Company Name", filter: true, width: '12%', filterDataKey: "Company Name" },
                    { name: "Director Name", filter: true, width: '8%', filterDataKey: "Contact Person" },
                    { name: "Designation", filter: true, width: '8%', filterDataKey: "Designation" },
                    { name: "Contact Number", filter: true, width: '8%', filterDataKey: "Contact No" },
                    { name: "FOB", filter: true, width: '6%' },
                    { name: "Top Countries", filter: true, width: '8%' },
                    { name: "Admin", filter: true, width: '8%' },
                    { name: "Last Note", filter: true, width: '20%', filterDataKey: "Task" },
                    { name: "Action", width: '13%' }
                  ]}
                  overalldata={overalldata}
                  expand={expandedData}
                  tableExpand={tableExpand}
                  expandKey={"EXPORTER_NAME"}
                  disableAction={false}
                  options={[
                    {
                      name: "Add Comment", icon: "", onClick: (index) => {
                        let noteFor = overalldata[index]?.EXPORTER_NAME
                        toggleNotePopup({ show: true, selectedIndex: index, noteFor })
                      }

                    },
                    {
                      name: "View Comment", icon: "", onClick: (index) => {
                        const item = overalldata[index]
                        getExpComment(item, index)
                      }
                    },
                    {
                      name: "Send Mail", icon: "", onClick: (index) => {
                        const item = overalldata[index]
                        let noteFor = overalldata[index]?.EXPORTER_NAME
                        toggleemailPopup({ data: item, show: true, selectedIndex: index, emailFor: noteFor })
                        setCurrentOverallEmailIds(item.EXTRA_DETAILS || [])
                        setCurrentEmailIds(item.EXTRA_DETAILS || [])
                      }

                    },
                    {
                      name: "Exporter Profile", icon: "", onClick: (index) => {
                        const item = overalldata[index]
                        localStorage.setItem('exporterDetails', JSON.stringify({
                          isVisible: true,
                          data: item,
                          isOnboarded: false
                        }))
                        window.open('/masterdataProfile', '_blank')
                      }

                    }
                  ]}
                >
                  {expandedData.length === 1 &&
                    <div className='row'>
                      <div className='w-30'>
                        <p className="text-decoration-underline font-size-12 font-wt-700">Recent 3 shipments</p>
                        {expandedData[0].Recent_Shipments?.map((data, index) => {
                          return <div className={`${index != expandedData[0]?.Recent_Shipments?.length - 1 ? 'border-bottom' : ''} py-2`}>
                            {
                              shipmentdetails.map((item, i) => {
                                return (
                                  <div className="col">
                                    <p className="d-flex d-flex align-items-top mb-0"><span className="col-md-2 px-0 BuyerdetailsLabel lsExpandTable">{item.name}</span><span className="mx-3">:</span><span className="col px-0 expandLabelValue" > {data[item.val] ? (item.unit ? item.unit : '') + (item.type === 'date' ? moment(data[item.val]).format('DD/MM/YYYY') : item.type === 'amount' ? Intl.NumberFormat("en", { notation: 'compact' }).format(data[item.val]) : data[item.val]) : "NA"}</span> </p>
                                  </div>
                                );
                              })
                            }
                          </div>
                        })}
                      </div>
                      <div className='w-30'>
                        <p className="text-decoration-underline font-size-12 font-wt-700">Top 3 shipments</p>
                        {expandedData[0].TOP_Shipments?.map((data, index) => {
                          return <div className={`${index != expandedData[0]?.TOP_Shipments?.length - 1 ? 'border-bottom' : ''} py-2`}>
                            {
                              shipmentdetails.map((item, i) => {
                                return (
                                  <div className="col">
                                    <p className="d-flex d-flex align-items-top mb-0"><span className="col-md-2 px-0 BuyerdetailsLabel lsExpandTable">{item.name}</span><span className="mx-3">:</span><span className="col px-0 expandLabelValue" > {data[item.val] ? (item.unit ? item.unit : '') + (item.type === 'date' ? moment(data[item.val]).format('DD/MM/YYYY') : item.type === 'amount' ? Intl.NumberFormat("en", { notation: 'compact' }).format(data[item.val]) : data[item.val]) : "NA"}</span> </p>
                                  </div>
                                );
                              })
                            }
                          </div>
                        })}
                      </div>
                      <div className='w-40'>
                        <p className="text-decoration-underline font-size-12 font-wt-700">Top 3 buyers and shipments</p>
                        <ul className='py-0 pl-3'>
                          {expandedData[0]?.TOP3_Buyers?.map(item => {
                            return <li >
                              <div className='font-size-14 expandLabelValue' >
                                {item._id + " - " + item.count}
                              </div>
                            </li>
                          })}
                        </ul>

                        <p className="text-decoration-underline font-size-12 font-wt-700">Other details</p>
                        <div className="col">
                          <p className="d-flex d-flex align-items-top mb-0">
                            <span className="col-md-3 px-0 BuyerdetailsLabel lsExpandTable">{"Total Shipments"}</span>
                            <span className="mx-3">:</span>
                            <span className="col px-0 expandLabelValue" >{expandedData?.[0]?.TOTAL_SHIPMENTS}</span> </p>
                        </div>
                        <div className="col">
                          <p className="d-flex d-flex align-items-top mb-0">
                            <span className="col-md-3 px-0 BuyerdetailsLabel lsExpandTable">{"Products"}</span>
                            <span className="mx-3">:</span>
                            <span className="col px-0 font-size-14" >
                              <ul className='py-0 pl-3'>
                                {expandedData?.[0]?.PRODUCTS?.map(item => {
                                  return <li >
                                    <div className='expandLabelValue'>
                                      {item._id}
                                    </div>
                                  </li>
                                })}
                              </ul>
                            </span>
                          </p>
                        </div>

                        <p className="text-decoration-underline font-size-12 font-wt-700">Company details</p>
                        <div className="col">
                          <p className="d-flex d-flex align-items-top mb-0">
                            <span className="col-md-3 px-0 BuyerdetailsLabel lsExpandTable">{"Address"}</span>
                            <span className="mx-3">:</span>
                            <span className="col px-0 font-size-14 expandLabelValue"> {expandedData?.[0].EXPORTER_ADDRESS}</span>
                          </p>
                        </div>

                        <div className="col">
                          <p className="d-flex d-flex align-items-top mb-0">
                            <span className="col-md-3 px-0 BuyerdetailsLabel lsExpandTable">{"Email ID"}</span>
                            <span className="mx-3">:</span>
                            <span className="col px-0 font-size-14 expandLabelValue"> {expandedData?.[0].EXTRA_DETAILS[0]?.["Email ID"]}</span>
                          </p>
                        </div>

                      </div>
                    </div>
                  }

                </ExpandableTable>

              </div>
              <Pagination page={page} totalCount={count} onPageChange={(p) => setPage(p)} perPage={filter.resultPerPage || 10} />
            </>
          }


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
export default connect(mapStateToProps, null)(CallList) 