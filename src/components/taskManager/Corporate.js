import moment from 'moment'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import call from '../../service'
import Filter from '../InvoiceDiscounting/components/Filter'
import Pagination from '../InvoiceDiscounting/contract/components/pagination'
import HeaderV2 from '../partial/headerV2'
import SideBarV2 from '../partial/sideBarV2'
import toastDisplay from '../../utils/toastNotification'
import { ExportExcel, addDaysSkipSundays, getContactObject, isEmpty } from '../../utils/myFunctions'
import { InputWithSelect, NewInput, NewSelect, NewTextArea } from '../../utils/newInput'
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
import { NewTable } from '../../utils/newTable'
import { INVapplicationStatus, LCapplicationStatus } from './ApplicationForm'
import InputEdit from '../viewProfile/components/inputEdit'
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

const createTaskDD = [
  { name: "Create New Task", img: "createTask.svg", label: "Create Task" },
  { name: "Call Didn't Connect", img: "didntconnect.svg", label: "Didn't Connect" },
  { name: "Call back requested", img: "callback.svg", label: "Call back" },
  { name: "Not Interested", img: "not_intrested.svg", label: "Not Interested" },
  { name: "Marked as Lost Lead", img: "marked_as_lost.svg", label: "Mark as Lost" }
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
  { name: "Hot", val: 'Hot (30 days or less)', color: 'text-color1' },
  { name: "Cold", val: 'Cold (60 days or more)', color: 'text-color1' },
  { name: "Warm", val: 'Warm (30-60 days)', color: 'text-color1' },
  { name: "Not Intrested", val: 'Not Interested', color: 'colorFE4141' },
  { name: 'Lost', val: 'Lead Lost', color: 'text-secondary' }
]
const Corporate = ({ userTokenDetails, navToggleState, renderAsChildren, hideGraphs, showForThisUser, changedFilterData, setChangedFilterData }) => {

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
  const [applicationPopup, toggleapplicationPopup] = useState({ show: false, data: [] })
  const [includedStatus, setIncludedStatus] = useState([0, 1, 2, 3])
  const [overalldata, setoveralldata] = useState([])
  const [salesPerson, setSalesPerson] = useState([])
  const [notePopup, toggleNotePopup] = useState({ show: false, data: "", selectedIndex: null, noteFor: "" })
  const [statsdata, setstatsdata] = useState({})
  const [tableExpand, setTableExpand] = useState("");
  const [expandedData, setExapndedData] = useState([]);
  const userPermissionsForSubAdmin = JSON.parse(userTokenDetails.UserAccessPermission || "{}")
  const userId = userTokenDetails?.user_id
  const userName = userTokenDetails?.userName
  const [activeIndex, setActiveIndex] = useState(0);
  const [EventStatus, setEventStatus] = useState(EventsArr)
  const [LogStatus, setLogStatus] = useState(LogsArr)
  const [viewDetails, setViewDetails] = useState({
    type: '',
    isVisible: false,
    data: {}
  })
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
  const [applicationHisdata, setapplicationHisdata] = useState({})
  const [updateApplicationPopup, setupdateApplicationPopup] = useState({
    show: false,
    data: null
  })
  const [callHistoryPopup, toggleCallHistoryPopup] = useState({ show: false, data: [] })
  const [viewCommentsPopup, setviewCommentsPopup] = useState({ show: false, data: [], selectedIndex: null, noteFor: "" })
  const [emailPopup, toggleemailPopup] = useState({ show: false, data: {}, selectedIndex: null, emailFor: "" })

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
  }, [])

  const handleOutsideClick = (event) => {
    let eventTargetStr = event?.target?.outerHTML
    console.log("handleOutsideClick", box.current, event?.target?.outerHTML);
    if (box && box.current && !box.current.contains(event.target) && !eventTargetStr?.includes("<select class=")) {
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
  const [selectedDateFilter, setselectedDateFilter] = useState('Current Month')
  const [showCalendar, setshowCalendar] = useState(false)
  const [viewCallHistoryexpand, setviewCallHistoryExpannd] = useState([])
  const [selectedExpIndex, setSelectedExpIndex] = useState(null)
  const box = useRef(null)
  const [search, setSearch] = useState('')
  const [searchedLocation, setSearchedLocation] = useState([])
  const [pricingUpdate, setPricingupdate] = useState(null)
  const [CurrentOverallEmailIds, setCurrentOverallEmailIds] = useState([])
  const [CurrentEmailIds, setCurrentEmailIds] = useState([])
  const [showMailTemplates, setshowMailTemplates] = useState({
    show: false,
    templates: []
  })
  const [selectedTemplate, setselectedTemplate] = useState(null)
  console.log('dataaaaaaaaaaaaaa', applicationHisdata);

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
  async function handleCallHistoryPopup(itemData) {
    setshowLoader(true)
    let apiResp = await call('POST', 'getCRMCallHistory', {
      EXPORTER_CODE: itemData.EXPORTER_CODE
    })
    // console.log("getTransactionHistoryForInvoiceLimit api resp====>", itemData, apiResp);
    setshowLoader(false)
    toggleCallHistoryPopup({ show: true, data: apiResp })
  }
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
    if (!userPermissionsForSubAdmin?.mainAdmin) {
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
    call('POST', 'getCallListFilters', objectAPI).then(res => {
      console.log("getCallListFilters then", res);
      setFilterData(res)
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
    if (userPermissionsForSubAdmin.mainAdmin || userPermissionsForSubAdmin?.["Assign Task"]) {
      setshowLoader(true)
      call("POST", 'getSubAdminUser', {}).then(res => {
        setshowLoader(false)
        setSalesPerson(res.data)
      }).catch(err => setshowLoader(false))
    } else {
      let onlyUserId = userTokenDetails?.sub_user_id
      setshowLoader(true)
      call("POST", 'getSubAdminUser', { onlyUserId }).then(res => {
        setshowLoader(false)
        setSalesPerson(res.data)
      }).catch(err => setshowLoader(false))
    }
  }, [])

  const getTasks = (isDownload) => {
    setshowLoader(true)
    let objectAPI = {
      currentPage: page,
      ...filter,
      resultPerPage: filter.resultPerPage,
      included_status: includedStatus,
      taskType: 'Corporate',
    }
    if (isDownload) {
      delete objectAPI["currentPage"]
      delete objectAPI["resultPerPage"]
    }
    if (!userPermissionsForSubAdmin?.mainAdmin) {
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
    call('POST', 'getAdminTasks', objectAPI)
      .then((result) => {
        if (isDownload) {
          let finaldata = []
          console.log('SalesPersoon', salesPerson)
          result?.message?.forEach((item, index) => {
            let mappedData = getContactObject(item.EXTRA_DETAILS ? item.EXTRA_DETAILS : [])
            let objectdata = {
              'EXPORTER NAME': item.EXPORTER_NAME,
              'Department': mappedData ? mappedData['Department'] ? mappedData['Department'] : 'NA' : 'NA',
              'Contact Person': mappedData ? mappedData['Contact Person'] ? mappedData['Contact Person'] : 'NA' : 'NA',
              'Contact Number': mappedData ? mappedData['Contact Number'] ? mappedData['Contact Number'] : 'NA' : 'NA',
              'FOB': item.FOB ? "$ " + Intl.NumberFormat("en", { notation: 'compact' }).format(item.FOB) : '',
              'Last Updated At': item.LastEventTime ? moment(item.LastEventTime).format('DD/MM/YYYY') : '',
              'Last Updated Status': item.LastEventType ? item.LastEventType : '',
              'Last Note': item.LastNote ? item.LastNote : item.LAST_NOTE ? item.LAST_NOTE : ''
            }
            finaldata.push(objectdata)
          })
          console.log('finaldata', finaldata);
          ExportExcel(finaldata, "CallList" + new Date().getTime())
          setshowLoader(false)
        } else {
          setPricingupdate(null)
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
  const getCorporateStats = () => {
    let objectAPI = {
      currentPage: page,
      ...filter,
      resultPerPage: filter.resultPerPage,
      included_status: includedStatus,

    }
    if (!userPermissionsForSubAdmin?.mainAdmin) {
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
    objectAPI["taskType"] = "Task Wise"
    call('POST', 'getCorporateStats', objectAPI).then(result => {
      console.log('resulttttt', result);
      //setstatsdata(result)

      let LogStatusArr = []
      let taskupdateOverall = 0
      for (let i = 0; i <= LogStatus.length - 1; i++) {
        const element = LogStatus[i]
        const matcheddata = result?.statsArr?.find(item => item.label === element.name)
        element["count"] = matcheddata ? matcheddata.total_records : 0
        if (matcheddata) {
          taskupdateOverall += matcheddata.total_records
        }
        LogStatusArr.push(element)
      }
      setLogStatus(LogStatusArr)
      setstatsdata({
        ...result.applicationStats,
        taskupdateOverall
      })
    }).catch(e => {

    })
  }
  useEffect(() => {
    getTasks()

  }, [page, refresh, salesPerson, filterData, includedStatus])
  useEffect(() => {
    getCorporateStats()
  }, [filterData, includedStatus])
  async function handlecontactsPopup(itemData) {
    setshowLoader(true)
    console.log("getTransactionHistoryForLC api resp====>", itemData);
    setshowLoader(false)
    togglecontactsPopup({ show: true, data: itemData.EXTRA_DETAILS?.filter(item => item['Contact Number']), EXPORTER_CODE: itemData.EXPORTER_CODE })
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

  async function handleApplicationPopup(itemData) {
    setshowLoader(true)
    // let apiResp = await call('POST', 'getCRMCallHistory', {
    //   EXPORTER_CODE: itemData.EXPORTER_CODE
    // })
    // console.log("getTransactionHistoryForInvoiceLimit api resp====>", itemData, apiResp);
    setshowLoader(false)
    toggleapplicationPopup({ show: true, data: itemData.crm_applications })
  }
  console.log('dataaaaaaaaa', data);
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
    }
    let temp = filterData
    if (temp["Date"]) {
      temp["Date"]["value"][0] = moment(startDate).format('YYYY-MM-DD')
      temp["Date"]["value"][1] = moment(endDate).format('YYYY-MM-DD')
      temp["Date"]["isFilterActive"] = true
      setFilterData({ ...temp })
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
    console.log('SalesPersoon', salesPerson)
    data.forEach((item, index) => {
      let mappedData = getContactObject(item.EXTRA_DETAILS ? item.EXTRA_DETAILS : [])

      row.push(item.EXPORTER_NAME)
      row.push(mappedData ? mappedData['Contact Person'] ? mappedData['Contact Person'] : 'NA' : 'NA')
      row.push(mappedData ? mappedData['Department'] ? mappedData['Department'] : 'NA' : 'NA')
      row.push(<div onClick={() => handlecontactsPopup(item)} className='cursor'>
        {mappedData ? mappedData['Contact Number'] ? mappedData['Contact Number'] : 'NA' : 'NA'}
      </div>)
      row.push(<ul className='py-0 pl-3 cursor' onClick={() => handleCountriesPOPUP(item)} >
        {item?.TOP_COUNTRIES?.slice(0, 2)?.map(item => {
          return <li >
            <div className='font-size-12'>
              {item.destination_country ? countriesObj[item.destination_country] ? countriesObj[item.destination_country] : item.destination_country : '-'}
            </div>
          </li>
        })}
      </ul>)
      row.push(<div class="w-100" >
        <label class="font-wt-600 font-size-13 cursor">
          {item.TASK_ASSIGNED_TO?.[0]?.contact_person || '-'}
        </label>
      </div>)
      row.push(<span onClick={() => handleApplicationPopup(item)}>{item.crm_applications.length}</span>)
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
      row.push(pricingUpdate === index ? <div className="col-md-12 px-0">
        <div class="input-group border-bottom mb-3">
          <input type={"text"} class="form-control border-0" placeholder={""} name={"pricing"} value={data.pricing} onChange={handleChange} onKeyDown={(event) => handleKeyDown(event, item._id)} />
        </div>
      </div> : <label className='font-size-12 mb-0 cursor' onClick={() => setPricingupdate(index)}>{item.PRICING || "-"}</label>)
      row.push(<div className='d-flex flex-row justify-content-between gap-3'>
        <div class="dropdown w-100" >
          <img src='assets/images/call_icon.svg' id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false" className='cursor' height={20} width={20} onClick={() => setSelectedExpIndex(index)} />
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton2">
            <div className=''>
              {createTaskDD.map((element, i) => {
                return <div className={`d-flex flex-row gap-2 align-items-center p-2 ${element.label != 'Mark as Lost' ? 'border-bottom' : ''} `} onClick={() => tasksAction(i, item)}>
                  <img src={`assets/images/${element.img}`} title={element.name} className='cursor' />
                  <label className='font-size-12 mb-0'>{element.label}</label>
                </div>
              })}
            </div>
          </ul>
        </div>
        <div>
          <img src='assets/images/corporate_meets.svg' className='cursor' height={20} width={20} onClick={() => {
            setSelectedExpIndex(index)
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
            const todaysdata = moment().format("hh:mm")
            item["HS_2_DIGIT"] = result
            setdata({
              ...data,
              event_status: "Hot (30 days or less)",
              event_date: moment(days).format('YYYY-MM-DD'),
              event_time: todaysdata,
              reminder: "30 minutes",
              assignedTo: userTokenDetails?.user_id,
              event_type: 'Offline Meet'
            })
            setIsOpen({
              isVisible: true,
              data: item
            })
          }} />
        </div>
      </div>)

      tableData.push(row)
      row = []
    })
    return tableData
  }
  useEffect(() => {
    setdbData(formatDataForTable(overalldata))
  }, [pricingUpdate])
  const updateCorporatePricing = (id) => {
    setshowLoader(true)
    let reqObj = {
      _id: id,
      pricing: data.pricing
    }
    console.log('pricing', reqObj);
    call('POST', 'updateCorporatePricing', reqObj).then(result => {
      toastDisplay(result, "success")
      setPricingupdate(null)
      getTasks()
      setshowLoader(false)
    }).catch(e => {
      toastDisplay(e, "error")
      setshowLoader(false)
    })
  }
  const expandedTable = (data, id, EXPORTER_NAME) => {
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
  const handleKeyDown = (event, id) => {
    event.persist();
    if (event.keyCode === 13) {
      updateCorporatePricing(id)
    }
  };
  const tasksAction = (index, item) => {
    if (index === 0) {
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
      const todaysdata = moment().format("hh:mm")
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
    }
    else if (index === 1) {
      setdata({
        ...data,
        event_status: "Busy",
        assignedTo: userTokenDetails?.user_id
      })
      setisOpenDidntRec({
        isVisible: true,
        selectedIndex: index
      })
    } else if (index === 2) {
      const days = moment().format('YYYY-MM-DD')
      const todaysdata = moment().add(5, "hours").format('hh:mm')
      setdata({
        ...data,
        event_status: "Busy",
        event_date: days,
        event_time: todaysdata,
        reminder: "30 minutes",
        assignedTo: userTokenDetails?.user_id
      })
      setisOpenCallback({
        isVisible: true,
        selectedIndex: index
      })
    } else if (index === 3) {
      setisOpenNotInt({
        isVisible: true,
        selectedIndex: index
      })
    } else if (index === 4) {
      setisOpenLost({
        isVisible: true,
        selectedIndex: index
      })
    }
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
        LOG_TYPE,
        LOST_REASON: type === 'closed' ? "Lead Not interested" : data.reasonForLost,
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
  const addExtraContactDetails = () => {
    let errors = {}
    if (!data.department) {
      errors.department = 'Department cannot be empty'
    }
    if (!data.contact_person) {
      errors.contact_person = 'Contact Person cannot be empty'
    }
    if (!data.designation) {
      errors.designation = 'Designation Cannot be empty'
    }
    if (!data.contactNo) {
      errors.contactNo = 'Contact Number cannot be empty'
    }
    if (!data.email_id) {
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
          "Contact Person": data.contact_person,
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
        getTasks()
      }).catch(e => {
        toastDisplay(e, "error")
        setshowLoader(false)
      })
    }
  }
  const getCRMApplicationHistory = (APPLICATION_NUMBER) => {
    setshowLoader(true)
    call('POST', 'getCRMApplicationHistory', { APPLICATION_NUMBER }).then(result => {
      let temp = { ...applicationHisdata }
      temp[APPLICATION_NUMBER] = result
      console.log('temppppppppp', temp);
      setapplicationHisdata(temp)
      setshowLoader(false)
    }).catch(e => {
      console.log('errror in crm', e);
      setshowLoader(false)
    })
  }
  const updateCorporateApplication = () => {
    let err = {}
    if (!data.applicationStatus) {
      err.applicationStatus = 'Mandatory Field'
    }
    if (!isEmpty(err)) {
      setErrors(err)
    } else {
      setshowLoader(true)
      let reqObj = {
        APPLICATION_NUMBER: updateApplicationPopup.data.APPLICATION_NUMBER,
        APPLICATION_STATUS: data.applicationStatus,
        APPLICATION_REMARK: data.applicationRemark,
        EXPORTER_CODE: updateApplicationPopup.data.EXPORTER_CODE,
        EXPORTER_NAME: updateApplicationPopup.data.EXPORTER_NAME,
      }
      call('POST', 'updateCorporateApplication', reqObj).then(result => {
        toastDisplay(result, "success")
        setshowLoader(false)
        getTasks()
        setupdateApplicationPopup({ show: false, data: null })
        toggleapplicationPopup({ show: false, data: null })
      }).catch(e => {
        toastDisplay(e, "error")
        setshowLoader(false)
      })
    }
  }

  const handleFilterOptions = (typedInput, name) => {
    // console.log("typedInput", typedInput);
    let tempEmailId = []
    let filtered = []
    tempEmailId = [{ id: "temp", [name]: "Add New Option", typedInput }]
    filtered = CurrentOverallEmailIds.filter((i) => {
      if (i[name] && i[name].toLowerCase().includes(typedInput.toLowerCase())) {
        return i
      }
    })
    if (!filtered.length) {
      filtered = tempEmailId
    }
    console.log('handleeefilteroptions', filtered);
    setCurrentEmailIds(filtered)
  };
  const sendEmail = () => {
    setshowLoader(true)
    let reqBody = {
      emailIds: data.emailto,
      subject: data.subject,
      mailBody: data.mailbody,
      userId
    }
    call('POST', 'sendEmailFromCRM', reqBody).then(result => {
      toastDisplay(result, 'success')
      toggleemailPopup({
        show: false,
        data: null,
        selectedIndex: null
      })
      setshowLoader(false)
    }).catch(e => {
      toastDisplay(e, 'error')
      setshowLoader(false)

    })
  }
  const addEmailTemplates = () => {
    setshowLoader(true)
    let reqBody = {
      subject: data.subject,
      mailBody: data.mailbody,
      userId,
      adminId: emailPopup.data?.TASK_ASSIGNED_TO[0]?.id
    }
    call('POST', 'addEmailTemplates', reqBody).then(result => {
      toastDisplay(result, 'success')
      setshowLoader(false)
      setdata({
        ...data,
        subject: '',
        mailbody: '',
        emailto: []
      })
    }).catch(e => {
      toastDisplay(e, 'error')
      setshowLoader(false)

    })
  }
  const getEmailTemplates = () => {
    setshowLoader(true)
    let reqBody = {
      adminId: emailPopup.data?.TASK_ASSIGNED_TO[0]?.id
    }
    call('POST', 'getEmailTemplates', reqBody).then(result => {
      setshowLoader(false)
      setshowMailTemplates({ show: true, templates: result })
    }).catch(e => {
      toastDisplay(e, 'error')
      setshowLoader(false)
    })
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
                      contact_person: "",
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
                      name={"contact_person"}
                      value={data.contact_person}
                      onChange={handleChange}
                      error={errors.contact_person}
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
        <div className="modal-dialog modal-md modal-dialog-centered ">
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
              <div className='w-100 text-center'>
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
                              contact_person: item["Contact Person"],
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

      <div className={`modal fade ${applicationPopup.show && "show"}`} style={applicationPopup.show ? { display: "block", "zIndex": '100001' } : {}}>
        <div className="modal-dialog modal-md mr-0 my-0">
          <div className="modal-content submitmodal pb-4"
          >

            <div className="modal-header border-0">
              <div className="w-100 d-flex align-items-center justify-content-between">
                <label
                  className="font-size-16 font-wt-600 text-color-value mx-3"
                >Ongoing Applications</label>
                <div className="modal-header border-0">
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => toggleapplicationPopup({ show: false, data: [] })}></button>
                </div>
              </div>
            </div>

            <div className="modal-body px-4">
              {applicationPopup?.data?.length ? applicationPopup?.data?.map((item, index) => {
                return (
                  <div className='col-md-12'>
                    <label className='font-size-14 w-100 mb-0'>Application No. :<span className='font-size-14 text-color1'>{item.APPLICATION_NUMBER}</span></label>
                    <label className='font-size-14 w-100 mb-0'>Financier Name :<span className='font-size-14'>{item?.SELECTED_FINANCIER?.name || "NA"}</span></label>
                    <br />
                    <br />
                    <label className='font-size-14 w-100 mb-0'>{moment(item.UPDATED_AT).format('DD/MM/YYYY - hh:mm A')}</label>
                    <label className='font-size-14 w-100 mb-0'>{item?.APPLICATION_TYPE || "NA"}</label>
                    <label className='font-size-14 w-100 mb-0'>Status :<span className='font-size-14'>{item?.APPLICATION_STATUS || "NA"}</span></label>

                    <label className='font-size-14  mt-3 text-decoration-underline text-color1'>
                      View Details
                      <img src='assets/images/arrow-right.png' style={{ filter: "invert(44%) sepia(97%) saturate(487%) hue-rotate(149deg) brightness(91%) contrast(82%)", height: "20px", width: "20px" }} />
                    </label>
                    <div className='mt-3 d-flex gap-2'>
                      <button className={`new-btn w-50 py-2 px-2 text-white cursor`} onClick={() => {
                        setupdateApplicationPopup({
                          show: true,
                          data: item
                        })
                      }}>Update Status</button>
                      <button className={`new-btn2 w-50 py-2 px-2 text-color1 cursor`} onClick={() => { }}>Upload Document</button>
                    </div>
                    <div className='mt-3'>
                      <label className='font-size-14 text-color1 ' onClick={() => {
                        let temp = [...viewCallHistoryexpand]
                        if (temp.indexOf(item.APPLICATION_NUMBER) !== -1) {
                          // If it does, remove it using splice
                          temp.splice(temp.indexOf(item.APPLICATION_NUMBER), 1);
                        } else {
                          // If it doesn't, add it to the array
                          temp.push(item.APPLICATION_NUMBER);
                          getCRMApplicationHistory(item.APPLICATION_NUMBER)
                        }
                        setviewCallHistoryExpannd(temp)
                      }}>
                        View History
                        <img src='assets/images/arrowdown.png' className='cursor' style={{ filter: "invert(44%) sepia(97%) saturate(487%) hue-rotate(149deg) brightness(91%) contrast(82%)" }} />
                      </label>
                      {viewCallHistoryexpand.includes(item.APPLICATION_NUMBER) && applicationHisdata[item.APPLICATION_NUMBER] && applicationHisdata[item.APPLICATION_NUMBER].length ?
                        applicationHisdata[item.APPLICATION_NUMBER].map(item => {
                          return <div className='d-flex flex-row ml-3'>
                            <div className="progressBarContainer2">
                              <div className="progressBarInnerCircle">
                              </div>
                            </div>
                            <div className='pl-4 pt-4 mt-2'>
                              <label className='font-size-14 text-color1 w-100'>{item.APPLICATION_STATUS}</label>
                              <label className='font-size-14 w-100'>{moment(item.CREATED_AT).format('dddd, DD MMMM, YYYY')}</label>
                              <label className='font-size-14 w-100'>{moment(item.CREATED_AT).format('hh:mm A')}</label>

                            </div>
                          </div>
                        })
                        : null
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

                            <p>
                              {item.ADMIN_NAME &&
                                <span className='mb-0 font-size-14 '>Created By:
                                  <span className='mb-0 font-size-14 '>
                                    {item.ADMIN_NAME}
                                  </span>
                                </span>
                              }
                            </p>
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

      {emailPopup.show &&
        <SendEmailPopup emailPopup={emailPopup} toggleemailPopup={toggleemailPopup} CurrentEmailIds={CurrentEmailIds} userId={userId} CurrentOverallEmailIds={CurrentOverallEmailIds} setCurrentOverallEmailIds={setCurrentOverallEmailIds} setCurrentEmailIds={setCurrentEmailIds} type={"TRF CRM"} EXPORTER_CODE={emailPopup.data.EXPORTER_CODE} EXPORTER_NAME={emailPopup.data.EXPORTER_NAME} userName={userTokenDetails?.userName} successHandler={getTasks} />
      }


      {updateApplicationPopup.show &&
        <FinanceInvoiceModal headerTitle={"Update Application Status"} isCentered={true} limitinvoice={updateApplicationPopup.show} closeSuccess={() => setupdateApplicationPopup({
          show: false,
          data: null
        })} >
          <div className='col-md-12 text-center d-flex justify-content-center'>
            <div className='col-md-9'>
              <label className='font-size-14 col-md-12 mb-0 text-left'>Application No. :<span className='font-size-14 text-color1'>{updateApplicationPopup.data?.APPLICATION_NUMBER}</span></label>
              <label className='font-size-14 col-md-12 mb-0 text-left'>Discounting type :<span className='font-size-14'>{updateApplicationPopup.data?.APPLICATION_TYPE}</span></label>
              <div className='col-md-12 mt-5'>
                <div className="row align-items-center mt-2">
                  <div className="form-group col-md-12 mb-0">
                    <NewSelect isAstrix={true} label={"Application status"}
                      selectData={!updateApplicationPopup.data?.APPLICATION_TYPE ? [] : updateApplicationPopup.data?.APPLICATION_TYPE.includes("LC") ? LCapplicationStatus : INVapplicationStatus} name={"applicationStatus"}
                      value={data.applicationStatus} optionLabel={"name"} optionValue={'name'}
                      onChange={handleChange} error={errors.applicationStatus} />
                  </div>
                </div>
              </div>
              <div className="col-md-12 mt-2">
                <NewTextArea
                  rows={6}
                  type={"text"} label={`Remark`} name={"applicationRemark"}
                  value={data.applicationRemark} error={errors.applicationRemark}
                  onChange={handleChange}
                />
              </div>
              <div>
                <button className={`new-btn w-50 py-2 px-2 text-white cursor`} onClick={updateCorporateApplication}>Update Status</button>
              </div>
            </div>
            <div>

            </div>
          </div>

        </FinanceInvoiceModal>
      }
      {isOpen.isVisible &&
        <BottomPopup isOpen={isOpen.isVisible} onClose={handleClose}>
          <div className='CreateNewTaskDiv'>
            <div className='d-flex flex-row align-items-center gap-3 justify-content-between'>
              {/* <p className='font-size-16 text-color1 font-wt-600 mb-0'>Create Task</p> */}
              <button className={` new-btn py-2 px-3 text-white cursor`} onClick={() => updateCRMTask('Create New Task', null)}>Save Task</button>
              <button className={` new-btn2 py-2 px-3 text-color1 cursor`} onClick={() => { updateCRMTask('Lead Created', null) }}>Add to Lead</button>
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
          <SideBarV2 state={"taskManagercorporate"} userTokenDetails={userTokenDetails} /> : null}
        <main role="main" className={`ml-sm-auto col-lg-${renderAsChildren ? '12' : '10'} ` + (navToggleState.status ? " expanded-right" : "")} id="app-main-div">
          {!renderAsChildren ?
            <HeaderV2
              title={"Task Manager"}
              userTokenDetails={userTokenDetails} /> : null}

          {!viewDetails.isVisible &&
            <>
              <div className='row mt-5'>
                <div className='w-14 pl-0'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <div className='row px-0 w-100'>
                      <div className='w-100 cursor'
                        onClick={() => {

                        }}>
                        <label className={`value font-wt-600  w-100 cursor`}>
                          {count || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"Exporters"}</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='w-25 pl-0'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <label className='w-100 font-size-14 text-color-value font-wt-600 pt-2 text-left'>{`Application Update - `}
                      <label className='font-size-14 text-color-value font-wt-600 text-color1'>{statsdata.total_count || 0}</label></label>
                    <div className='row px-0 w-100'>
                      <div className='w-33 cursor'
                        onClick={() => {

                        }}>
                        <label className={`value font-wt-600  w-100 cursor`}>
                          {statsdata.lc_count || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"LC"}</label>
                      </div>
                      <div className='w-33 cursor'
                        onClick={() => {
                        }}>
                        <label className={`value font-wt-600  w-100 cursor`}>
                          {statsdata.inv_count || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"Inovice"}</label>
                      </div>
                      <div className='w-33 cursor'
                        onClick={() => {
                        }}>
                        <label className={`value font-wt-600  w-100 cursor`}>
                          {statsdata.others_count || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"Others"}</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ width: "37%" }}>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <label className='w-100 font-size-14 text-color-value font-wt-600 pt-2 text-left'>{`Task Update - `}
                      <label className='font-size-14 text-color-value font-wt-600 text-color1'>{statsdata.taskupdateOverall || 0}</label></label>
                    <div className='row px-0 w-100'>
                      {LogStatus.map((item, index) => {
                        return <div className='w-20 cursor'
                        >
                          <label className={`value font-wt-600  w-100 cursor ${item.color}`}>
                            {item.count || 0}
                          </label>
                          <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{item.name}</label>
                        </div>
                      })}

                    </div>
                  </div>
                </div>
                {/* <div className='w-10 pl-0'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <div className='row px-0 w-100'>
                      <div className='w-50 cursor'
                        onClick={() => {

                        }}>
                        <label className={`value font-wt-600  w-100 cursor colorFE4141`}>
                          {statsdata.FollowupCount || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{"Overdue Task"}</label>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
              <div className="filter-div ml-0 mt-1">
                <Filter
                  isAdditionalButton={true}
                  filterData={changedFilterData || filterData} setFilterData={setChangedFilterData || setFilterData} showFilterBtn={true} showDownloadIcon={true}
                  showResultPerPage={true} count={count} filter={filter} setFilter={setFilter} refresh={refresh} setRefresh={setRefresh} onDownloadClick={() => getTasks(true)} resetPage={() => setPage(1)} >
                  <div className="d-flex gap-4">
                    <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={() => { window.location = '/corporateApplication' }}>Add new Application</button>
                  </div>
                </Filter>
              </div>

              <div className="mb-3">
                <ExpandableTable
                  tableFixed data={dbData}
                  columns={[
                    { name: "Company Name", filter: false, width: '12%' },
                    { name: "Director Name", filter: false, width: '8%' },
                    { name: "Designation", filter: false, width: '8%' },
                    { name: "Contact Number", filter: false, width: '10%' },
                    { name: "Top Countries", filter: false, width: '8%' },
                    { name: "Admin", filter: false, width: '7%' },
                    { name: "No. of Applications", filter: false, width: '7%' },
                    { name: "Remark", filter: false, width: '18%' },
                    { name: "Pricing", filter: false, width: '7%' },
                    { name: "Action", width: '5%' }
                  ]}
                  overalldata={overalldata}
                  expand={expandedData}
                  tableExpand={tableExpand}
                  expandKey={"EXPORTER_NAME"}
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
    navToggleState: state.navToggleState
  }
}
export default connect(mapStateToProps, null)(Corporate) 