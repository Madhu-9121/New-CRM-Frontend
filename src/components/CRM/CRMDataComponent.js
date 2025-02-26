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
import toastDisplay from '../../utils/toastNotification'
import { CustomSelect, InputWithSelect, NewInput, NewSelect, NewTextArea } from '../../utils/newInput'
import BottomPopup from '../TaskManager/BottomPopup'
import { ExportExcel, addDaysSkipSundays, getContactObject, isEmpty } from '../../utils/myFunctions'
import { reminders } from '../chatRoom/components/calenderView'
import axios from 'axios'
import { platformBackendUrl } from '../../urlConstants'
import MultipleSelect from '../../utils/MultipleSelect'
import DropdownMenu from '../TaskManager/DropDownMenu'
import FinanceInvoiceModal from '../InvoiceDiscounting/contract/components/financeinvoiceModal'
import SendEmailPopup from '../TaskManager/SendEmailPopup'

export const EventsArr = [
  { name: "Hot", val: 'Hot (30 days or less)' },
  { name: "Cold", val: 'Cold (60 days or more)' },
  { name: "Warm", val: 'Warm (30-60 days)' }
]

export const requirements = [
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

export const LogsArr = [
  { name: "Task", val: 'Create New Task', color: 'color3DB16F' },
  { name: "Didn't Connect", val: 'Didnt connect', color: 'text-color1' },
  { name: "Call back", val: 'Call back', color: 'textFFB801' },
  { name: "Not Intrested", val: 'Not Interested', color: 'colorFE4141' },
  { name: 'Lost', val: 'Lead Lost', color: 'text-secondary' }
]

const CRMDataComponent = ({ userTokenDetails, navToggleState, renderAsChildren, hideGraphs, showForThisUser, changedFilterData, setChangedFilterData }) => {
  const folderName = localStorage.getItem('folderName')
  const folderdetails = JSON.parse(localStorage.getItem('folderdetails'))
  const queryParams = new URLSearchParams(window.location.search)
  let serarchParam = queryParams.get('search')
  let todayDateObj = moment()
  let lastMonthDateObj = moment().subtract("1", "months")
  const [data, setdata] = useState({ foldername: folderName })
  const [errors, setErrors] = useState({})
  const [refresh, setRefresh] = useState(0)
  const [filter, setFilter] = useState({ resultPerPage: 10, randomSelected: 10, search: serarchParam })
  const [filterData, setFilterData] = useState({})
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [dbData, setdbData] = useState([])
  const [contactsPopup, togglecontactsPopup] = useState({ show: false, data: [], EXPORTER_CODE: '' })
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

  const [EventStatus, setEventStatus] = useState(EventsArr)
  const [LogStatus, setLogStatus] = useState(LogsArr)
  const [activeIndex, setActiveIndex] = useState(0);
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
  const [taskUpdate, settaskUpdate] = useState('Select')
  const [selectedExpIndex, setSelectedExpIndex] = useState(null)

  const [addmoreContacts, setAddMoreContacts] = useState(false)
  const [countrydata, setCountrydata] = useState([])
  const [isEditContact, setIsEditContact] = useState({
    isEdit: false,
    _id: ""
  })
  const [includedStatus, setIncludedStatus] = useState([0, 1, 2, 3, 4])
  const [emailPopup, toggleemailPopup] = useState({ show: false, data: {}, selectedIndex: null, emailFor: "" })
  const [CurrentOverallEmailIds, setCurrentOverallEmailIds] = useState([])
  const [CurrentEmailIds, setCurrentEmailIds] = useState([])
  useEffect(() => {
    // Get the current URL
    const currentURL = window.location.href;

    // Parse the URL to get the current query parameters
    const urlObject = new URL(currentURL);
    const queryParams = new URLSearchParams(urlObject.search);

    // Update or add the 'state' query parameter with the new state value
    queryParams.set('search', filter.search);

    // Replace the existing query parameters with the updated ones
    urlObject.search = queryParams.toString();

    // Replace the current URL with the updated one
    const updatedURL = urlObject.toString();

  }, [filter.search])
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
  const [isMinimized, setISMinimized] = useState(false)
  const [taskType, setTaskType] = useState('Task Wise')

  const [closeLeadPopup, setcloseLeadPopup] = useState(false)
  const [closeEventName, setcloseEventName] = useState('')
  const [assignType, setAssignType] = useState('Random')
  const [selectedTask, setSelectedTask] = useState('Call List')
  const [assignmentType, setAssignmentType] = useState('Single')
  const [selectedIndex, setSelectedIndex] = useState([])
  const [showdropdown, setshowdropdown] = useState(false)
  const [assignTaskLevel, setassignTaskLevel] = useState(0)
  const [overallIndex, setoverallIndex] = useState([])
  const [callHistoryPopup, toggleCallHistoryPopup] = useState({ show: false, data: [] })


  const userPermissionsForSubAdmin = JSON.parse(userTokenDetails.UserAccessPermission || "{}")
  const userId = userTokenDetails?.user_id
  const userName = userTokenDetails?.userName

  const [onlyShowForUserId, setonlyShowForUserId] = useState(userPermissionsForSubAdmin?.mainAdmin ? undefined : userId)

  const handleAccordianClick = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };
  async function handlecontactsPopup(itemData) {
    setshowLoader(true)
    console.log("getTransactionHistoryForLC api resp====>", itemData);
    setshowLoader(false)
    togglecontactsPopup({ show: true, data: itemData.EXTRA_DETAILS, EXPORTER_CODE: itemData.EXPORTER_CODE })
  }
  useEffect(() => {
    if (data.subadmins) {
      getTasks()
      getOverallCRMTasksStats()
      setonlyShowForUserId(undefined)
    } else {
      setonlyShowForUserId(userPermissionsForSubAdmin?.mainAdmin ? undefined : userId)
    }
  }, [data.subadmins])
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
  useEffect(() => {
    // let isCacheExist = localStorage.getItem('taskManagerFilterData') != "{}"
    // if (!isCacheExist) {
    let objectAPI = {}
    if (!userPermissionsForSubAdmin?.mainAdmin) {
      objectAPI["onlyShowForUserId"] = userId
    }
    call('POST', 'getOverallCRMTasksFilters', objectAPI).then(res => {
      console.log("getOverallCRMTasksFilters then", res);
      setFilterData(res)
    }).catch(err => { })
    axios.get(platformBackendUrl + "/getallCountry").then((result) => {
      if (result.data.message && result.data.message.length) {
        setCountrydata(result.data.message);
      }
    });
    // }
  }, [])
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
        LOG_TYPE,
        LOST_REASON: type === 'closed' ? "Lead Not interested" : data.reasonForLost,
        ADMIN_ID: userId,
        ADMIN_NAME: userName
      }

      reqObj["EXPORTER_CODE"] = overalldata[selectedExpIndex]?.EXPORTER_CODE
      reqObj["EXPORTER_NAME"] = overalldata[selectedExpIndex]?.EXPORTER_NAME

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
  const getOverallCRMTasksStats = () => {
    setshowLoader(true)
    let objectAPI = {
      currentPage: page,
      ...filter,
      resultPerPage: filter.resultPerPage,
      included_status: includedStatus,
      taskType,
      folderName,
      screen_name: "CRM List"
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
    call('POST', 'getOverallCRMStats', objectAPI).then(result => {
      console.log('resulttttt', result);
      //setstatsdata(result)
      let total = 0
      let eventStatusArr = []
      for (let i = 0; i <= EventStatus.length - 1; i++) {
        const element = EventStatus[i]
        const matcheddata = result?.eventResponse?.find(item => item.EVENT_TYPE === element.val)
        element["count"] = matcheddata ? matcheddata.total_records : 0
        total += matcheddata ? matcheddata.total_records : 0
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
        totalCount: total
      })
      setshowLoader(false)
    }).catch(e => {
      setshowLoader(false)

    })
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
      included_status: includedStatus,
      folderName
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
    if (data.subadmins) {
      delete objectAPI["onlyShowForUserId"]
      objectAPI["leadAssignedTo"] = data.subadmins
    }
    call('POST', 'getOverallCRMTasks', objectAPI)
      .then((result) => {
        if (isDownload) {
          downLoadMasterdata(result.message)
          setshowLoader(false)
        } else {
          setdbData(formatDataForTable(result.message))
          setCount(result.total_records)
          setoveralldata(result.message)
          setshowLoader(false)
          setassignTaskLevel(0)
        }

      }).catch(e => {
        setshowLoader(false)
      })
  }
  useEffect(() => {
    getTasks()
  }, [page, refresh, salesPerson, filterData])

  useEffect(() => {
    getOverallCRMTasksStats()
  }, [refresh, filterData])

  const updateLeadAssignedTo = (leadAssignedName, id) => {
    call('POST', 'updateEnquiryLeadAssignedTo', { leadAssignedName, id }).then(result => {
      toastDisplay("Lead updated", "success")
      getTasks()
    }).catch(e => {
      toastDisplay("Failed to assign lead to " + leadAssignedName, "error")
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
  function formatDataForTable(data) {
    let tableData = []
    let row = []
    console.log('SalesPersoon', salesPerson)
    data.forEach((item, index) => {

      let mappedData = getContactObject(item.EXTRA_DETAILS ? item.EXTRA_DETAILS : [])

      row[0] = item.task_logs ? item.task_logs?.[0]?.EVENT_STATUS?.split("(")[0] || 'NA' : 'NA'
      row[1] = <span className={`${item.STATUS === 4 ? 'color-2ECC71' : ''} cursor`} onClick={() => {
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
      }} >{item.EXPORTER_NAME}</span>
      row[2] = mappedData ? mappedData['Contact Person'] ? mappedData['Contact Person'] : 'NA' : 'NA'
      row[3] = mappedData ? mappedData['Designation'] ? mappedData['Designation'] : 'NA' : 'NA'
      row[4] = <div onClick={() => handlecontactsPopup(item)} className='cursor'>
        {mappedData ? mappedData['Contact Number'] ? mappedData['Contact Number'] : 'NA' : 'NA'}
      </div>
      row[5] = Intl.NumberFormat("en", { notation: 'compact' }).format(item.FOB || 0)
      row[6] = <label class="font-wt-600 font-size-13 cursor">
        {item.TASK_ASSIGNED_TO?.[0].contact_person || 'NA'}
      </label>
      row[7] = <span className='cursor' onClick={() => handleCallHistoryPopup(item)}>
        <span className='font-wt-600'>
          {item.LastEventTime ? moment(item.LastEventTime).format('DD/MM/YYYY') + ": " : ''}
        </span>
        <span className='font-wt-600'>
          {item.LastEventType ? item.LastEventType + "-" : ''}
        </span>
        <span className='font-wt-500' dangerouslySetInnerHTML={{ __html: item.LastNote ? item.LastNote.length > 60 ? item.LastNote.slice(0, 60) + "......." : item.LastNote : item.LAST_NOTE ? item.LAST_NOTE.length > 60 ? item.LAST_NOTE.slice(0, 60) + "......." : item.LAST_NOTE : '' }}>
        </span>
        {item.task_logs?.length ?
          <span className='font-wt-800 font-size-14' >{` (${item.task_logs ? item.task_logs.length : 0}) `}</span> : null}
      </span>

      tableData.push(row)
      row = []
    })
    return tableData
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
    ExportExcel(finaldata, "CRMData" + new Date().getTime())
  }
  const AssignTasksInBulkV2 = (assingeeId, assignedIdSec) => {
    let exporterArr = []
    for (let i = 0; i <= selectedIndex.length - 1; i++) {
      const index = selectedIndex[i]
      console.log('Indexxxxxxxx', overalldata[index], index, overalldata);
      exporterArr.push({
        EXPORTER_CODE: overalldata[index].EXPORTER_CODE
      })
    }
    let obj = {
      [assignmentType === 'Single' ? assingeeId : `('${assingeeId}','${assignedIdSec}')`]: {
        EXPORTER_CODE: exporterArr,
        selectedTask
      }
    }

    let reqObj = {
      AssignmentObject: obj,
      FOLDER_NAME: data.foldername,
      ASSIGNEE_ID: userTokenDetails?.user_id,
      ASSIGNEE_NAME: userTokenDetails?.userName,
      FILTERS: []
    }
    setshowLoader(true)
    console.log('API REQ', reqObj);
    call('POST', 'AssignMasterBulkDataTask', reqObj).then(result => {
      toastDisplay(result, "success")
      setshowLoader(false)
      setshowdropdown(false)
      getTasks()
      getOverallCRMTasksStats()
    }).catch(e => {
      setshowLoader(false)
      toastDisplay(e, "error")
    })
  }
  useEffect(() => {
    if (assignTaskLevel === 1) {
      updateTableRows()
    }
  }, [assignTaskLevel])
  const updateTableRows = () => {
    let tabledata = []
    dbData.forEach((item, index) => {
      let row = []
      row[0] = <img onClick={() => {
        let temp = [...selectedIndex]
        let temp2 = [...selectedIndex]
        if (temp2.indexOf(index) !== -1) {
          temp2.slice(temp2.indexOf(index), 1)
        } else {
          temp2.push(index);
        }
        if (temp.indexOf(index) !== -1) {
          // If it does, remove it using splice
          temp.splice(temp.indexOf(index), 1);
        } else {
          // If it doesn't, add it to the array
          temp.push(index);
        }
        console.log('selectedindex', temp, temp2);
        setSelectedIndex(temp)
        setoverallIndex(temp)
      }} src={`assets/images/${selectedIndex.includes(index) ? 'checked-green' : 'empty-check'}.png`} />
      row[1] = item[0]
      row[2] = item[1]
      row[3] = item[2]
      row[4] = item[3]
      row[5] = item[4]
      row[6] = item[5]
      row[7] = item[6]
      row[8] = item[7]
      row[9] = item[8]
      tabledata.push(row)
      row = []
    })
    console.log('tabledataaaaa', tabledata);
    setdbData(tabledata)
  }
  const updateTableRowsTicks = () => {
    let tabledata = []
    dbData.forEach((item, index) => {
      let row = []
      row[0] = <img onClick={() => {
        let temp = [...selectedIndex]
        let temp2 = [...selectedIndex]
        if (temp2.indexOf(index) !== -1) {
          temp2.slice(temp2.indexOf(index), 1)
        } else {
          temp2.push(index);
        }
        if (temp.indexOf(index) !== -1) {
          // If it does, remove it using splice
          temp.splice(temp.indexOf(index), 1);
        } else {
          // If it doesn't, add it to the array
          temp.push(index);
        }
        console.log('selectedindex', temp, temp2);
        setSelectedIndex(temp)
        setoverallIndex(temp)
      }} src={`assets/images/${selectedIndex.includes(index) ? 'checked-green' : 'empty-check'}.png`} />
      row[1] = item[1]
      row[2] = item[2]
      row[3] = item[3]
      row[4] = item[4]
      row[5] = item[5]
      row[6] = item[6]
      row[7] = item[7]
      row[8] = item[8]
      row[9] = item[9]

      tabledata.push(row)
      row = []
    })
    setdbData(tabledata)
  }
  const fillIndexes = () => {
    let indexArray = [...overallIndex];
    let filledArray = [];

    for (let i = 0; i <= indexArray.length - 1; i++) {
      let start = indexArray[i];
      let end = indexArray[i + 1];
      let valuesToAdd = [];

      for (let j = start; j <= end; j++) {
        valuesToAdd.push(j);
      }

      filledArray = filledArray.concat(valuesToAdd);
    }
    if (filledArray.length) {
      setSelectedIndex([... new Set(filledArray)])
    } else {
      setSelectedIndex([... new Set(indexArray)])
    }
    console.log('overallindex', filledArray);
    //setSelectedIndex(filledArray)
  }
  useEffect(() => {
    if (assignType != 'Random') {
      fillIndexes()
    }
  }, [overallIndex, assignType])
  useEffect(() => {
    if (assignTaskLevel === 1) {
      updateTableRowsTicks()
    }
  }, [selectedIndex])
  return (

    <div className={renderAsChildren ? "" : "container-fluid"}>
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      {emailPopup.show &&
        <SendEmailPopup emailPopup={emailPopup} toggleemailPopup={toggleemailPopup} CurrentEmailIds={CurrentEmailIds} userId={userId} CurrentOverallEmailIds={CurrentOverallEmailIds} setCurrentOverallEmailIds={setCurrentOverallEmailIds} setCurrentEmailIds={setCurrentEmailIds} type={"TRF CRM"} EXPORTER_CODE={emailPopup.data.EXPORTER_CODE} EXPORTER_NAME={emailPopup.data.EXPORTER_NAME} userName={userTokenDetails?.userName} successHandler={getTasks} />
      }
      <div className={`modal fade ${callHistoryPopup.show && "show"}`} style={callHistoryPopup.show ? { display: "block", "zIndex": '10000001' } : {}}>
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
      {showdropdown &&
        <FinanceInvoiceModal limitinvoice={showdropdown} headerTitle={''} modalSize={"sm"} closeSuccess={() => {
          setshowdropdown(false)
        }}>
          <div>

            <label className="font-size-16 font-wt-600 text-color-value text-center w-100" >{'Assign Task'}</label>

            <label className='text-left w-100 font-size-14 font-wt-500 ml-2'>{`Data Count : ${selectedIndex.length}`}</label>
            <div>
              <div className="col-md-12 pt-1 ">
                <div className="col-md-11 px-0">
                  <NewInput isAstrix={true} type={"text"} label={"Folder Name"}
                    name={"foldername"} value={data.foldername}
                    onChange={handleChange} />
                </div>
              </div>

            </div>
            <div className='d-flex flex-row align-items-center' >
              <div className='d-flex flex-row px-2' onClick={() => setSelectedTask('Corporate')}>
                <input className="form-check-input" type="radio" value={"Corporate"} checked={selectedTask === 'Corporate'} />
                <label className="form-check-label p-0 m-0" >
                  Corporate
                </label>
              </div>
              <div className='d-flex flex-row px-2' onClick={() => setSelectedTask('Call List')}>
                <input className="form-check-input" type="radio" value={"Call List"} checked={selectedTask === 'Call List'} />
                <label className="form-check-label p-0 m-0" >
                  Call List
                </label>
              </div>
            </div>
            <div className='d-flex flex-row align-items-center mt-3' >
              <div className='d-flex flex-row px-2' onClick={() => setAssignmentType('Single')}>
                <input className="form-check-input" type="radio" value={"Single"} checked={assignmentType === 'Single'} />
                <label className="form-check-label p-0 m-0" >
                  Single
                </label>
              </div>
              <div className='d-flex flex-row px-2' onClick={() => setAssignmentType('Multiple')}>
                <input className="form-check-input" type="radio" value={"Multiple"} checked={assignmentType === 'Multiple'} />
                <label className="form-check-label p-0 m-0" >
                  Multiple
                </label>
              </div>
            </div>
            <div className='col-md-12 mt-4'>
              <NewSelect
                selectData={[...salesPerson, { id: 0, contact_person: 'Unassign' }]}
                optionLabel={'contact_person'} optionValue={'id'}
                name={"leadAssignedTo"} label={assignmentType === 'Multiple' ? 'Select Primary Admin' : 'Select Admin'} value={data.leadAssignedTo}
                onChange={handleChange} error={errors.leadAssignedTo}
              />
            </div>

            {assignmentType === 'Multiple' &&
              <div className='col-md-12 mt-4'>
                <NewSelect
                  selectData={[...salesPerson, { id: 0, contact_person: 'Unassign' }]}
                  optionLabel={'contact_person'} optionValue={'id'}
                  name={"leadAssignedToSec"} label={assignmentType === 'Multiple' ? 'Select Secondary Admin' : 'Select Admin'} value={data.leadAssignedToSec}
                  onChange={handleChange} error={errors.leadAssignedToSec}
                />
              </div>
            }
            <div className='w-100 text-center'>
              <button type="button"
                onClick={() => {
                  if (selectedIndex.length > 0) {
                    if (data.leadAssignedTo) {
                      if (data.foldername) {
                        AssignTasksInBulkV2(data.leadAssignedTo, data.leadAssignedToSec)
                      } else {
                        toastDisplay("Folder name cannot be empty", "info")
                      }

                    } else {
                      toastDisplay("Select sub admin", "info")
                    }
                  } else {
                    toastDisplay("Select at least one exporter to assign task", "info")
                  }
                }}
                className={`new-btn w-60 py-2 px-3 text-white`}>
                {"Assign Task"}
              </button>
            </div>

          </div>
        </FinanceInvoiceModal>
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
                          <p className='font-size-14 text-color-label font-wt-600 mb-0'>
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
          <SideBarV2 state={"CRMdata"} userTokenDetails={userTokenDetails} /> : null}
        <main role="main" className={`ml-sm-auto col-lg-${renderAsChildren ? '12' : '10'} ` + (navToggleState.status ? " expanded-right" : "")} id="app-main-div">
          {!renderAsChildren ?
            <HeaderV2
              title={"CRM Data"}
              userTokenDetails={userTokenDetails} /> : null}
          {!viewDetails.isVisible &&
            <>
              <div className='d-flex flex-row align-items-start justify-content-between mb-4'>
                <div className='d-flex flex-row align-items-center gap-4'>
                  <div>
                    <img src="assets/images/ArrowBackLeft.png" height={20} width={20} className="cursor mx-2" onClick={() => {
                      window.location = '/crmdata'
                    }} />
                  </div>
                  <div>
                    <label className='font-size-15 font-wt-600 mb-0'>{folderdetails.folder_name || 'Default'}</label>
                    <div className='d-flex flex-row'>
                      <label className='font-size-14 text-secondary mb-0'>Data category :</label>
                      <label className='font-size-14 text-secondary mb-0'>{folderdetails.filters?.map(item => item.name).join(" | ")}</label>
                    </div>
                  </div>

                </div>
              </div>
              <div className='row'>
                <div className='w-14 ml-2'>
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

                <div className='w-14'>
                  <label>Task Type</label>
                  <NewSelect
                    selectData={[{ name: "Task Wise" }, { name: "Exporter Wise" }]}
                    optionLabel={'name'} optionValue={'name'} value={taskType}
                    onChange={(e) => {
                      setTaskType(e.target.value)
                    }}
                  />
                </div>
                <div className='w-14'>
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
                <div className='w-14'>
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
                <div className='w-14'>
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
                  <div className='w-14'>
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
                  <div className='w-14'>
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
              <div className='row mt-3 pl-3'>
                <div className='w-25 pl-0'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <label className='w-100 font-size-14 text-color-value font-wt-600 pt-2 text-left'>{`Total Data - `}
                      <label className='font-size-14 text-color-value font-wt-600 text-color1'>{statsdata.totalCount || 0}</label></label>
                    <div className='row px-0 w-100'>
                      {EventStatus.map(item => {
                        return <div className='w-33 cursor'
                          onClick={() => {
                            let temp = filterData
                            console.log('filterdataaaaaa', temp)
                            temp["Enquiry Type"]["data"][0]["isChecked"] = true
                            temp["Enquiry Type"]["data"][1]["isChecked"] = false
                            temp["Enquiry Type"]["isFilterActive"] = true
                            setFilterData({ ...temp })
                          }}>
                          <label className={`value font-wt-600  w-100 cursor`}>
                            {item.count || 0}
                          </label>
                          <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{item.name}</label>
                        </div>
                      })}
                    </div>
                  </div>
                </div>
                <div className='w-13'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <label className={`w-100  value font-wt-600 text-custom2 text-left`}>
                      {statsdata.pendingCount || 0}
                    </label>
                    <label
                      onClick={() => {
                        let temp = filterData
                        temp["Lead Status"]["data"][1]["isChecked"] = true
                        temp["Lead Status"]["data"][0]["isChecked"] = false
                        temp["Lead Status"]["isFilterActive"] = true
                        setFilterData({ ...temp })
                      }}
                      className={'w-100 font-size-14 font-wt-700 text-color-value text-left cursor'}>{"Task Incomplete"}</label>
                  </div>
                </div>
                <div className='w-13'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <label className={`w-100  value font-wt-600 text-custom2 text-left`}>
                      {statsdata.leadsCount || 0}
                    </label>
                    <label
                      onClick={() => {
                        let temp = filterData
                        temp["Leads"]["data"][0]["isChecked"] = true
                        temp["Leads"]["data"][1]["isChecked"] = false
                        temp["Leads"]["isFilterActive"] = true
                        setFilterData({ ...temp })
                        setRefresh(refresh + 1)
                      }}
                      className={'w-100 font-size-14 font-wt-700 text-color-value text-left cursor'}>{"Lead"}</label>
                  </div>
                </div>
                <div className='w-12'>
                  <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                    <label className={`w-100  value font-wt-600 text-custom2 text-left`}>
                      {statsdata.onboardCount || 0}
                    </label>
                    <label
                      onClick={() => {
                        let temp = filterData
                        temp["Task Update"]["data"][0]["isChecked"] = false
                        temp["Task Update"]["data"][1]["isChecked"] = false
                        temp["Task Update"]["data"][2]["isChecked"] = false
                        temp["Task Update"]["data"][3]["isChecked"] = false
                        temp["Task Update"]["data"][4]["isChecked"] = false
                        temp["Task Update"]["data"][5]["isChecked"] = true
                        temp["Task Update"]["isFilterActive"] = true
                        setFilterData({ ...temp })
                        setRefresh(refresh + 1)
                      }}
                      className={'w-100 font-size-14 font-wt-700 text-color-value text-left cursor'}>{"Onboarded"}</label>
                  </div>
                </div>
                <div style={{ width: "37%" }}>
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
                  filterData={changedFilterData || filterData} setFilterData={setChangedFilterData || setFilterData} showFilterBtn={true}
                  showResultPerPage={true} count={count} filter={filter} setFilter={setFilter} refresh={refresh} setRefresh={setRefresh} onDownloadClick={() => getTasks(true)} showDownloadIcon={true} isAdditionalButton={true} showSelectOption={assignTaskLevel >= 1} setAssignType={setAssignType}>

                  <div className="d-flex gap-4">
                    <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={() => {
                      if (assignTaskLevel >= 1) {
                        //open popup
                        setshowdropdown(!showdropdown)
                        console.log('showdropdown');
                      } else {
                        setassignTaskLevel(assignTaskLevel + 1)
                      }
                    }} type='button'>{showdropdown ? 'Assign To' : 'Assign Task'}</button>

                  </div>
                </Filter>
              </div>

              <div className="mb-3">
                <NewTable
                  //columns={Shipmentcolumns} 
                  tableFixed data={dbData}
                  columns={assignTaskLevel >= 1 ? [
                    {
                      name: <img className='cursor' onClick={() => {
                        if (selectedIndex.length === dbData.length) {
                          setSelectedIndex([])
                        } else {
                          let selectedData = []
                          for (let i = 0; i <= dbData.length - 1; i++) {
                            selectedData.push(i)
                          }
                          setSelectedIndex(selectedData)
                        }

                      }} src={
                        `assets/images/${selectedIndex.length === dbData.length ? 'checked-green' : 'empty-check'
                        }.png`
                      } />,
                      width: 'w-7'
                    },
                    { name: "Status", colClass: 'w-7' },
                    { name: "Exporter Name", colClass: 'w-18' },
                    { name: "Director Name", colClass: 'w-14' },
                    { name: "Designation", colClass: 'w-14' },
                    { name: "Contact No.", colClass: 'w-10' },
                    { name: "FOB ($)", colClass: 'w-5' },
                    { name: "Assign To", colClass: 'w-14' },
                    { name: "Last note", colClass: 'w-14' }
                  ] : [
                    { name: "Status", colClass: 'w-7' },
                    { name: "Exporter Name", colClass: 'w-18' },
                    { name: "Director Name", colClass: 'w-14' },
                    { name: "Designation", colClass: 'w-14' },
                    { name: "Contact No.", colClass: 'w-10' },
                    { name: "FOB ($)", colClass: 'w-5' },
                    { name: "Assign To", colClass: 'w-14' },
                    { name: "Last note", colClass: 'w-20' }
                  ]}
                  options={[
                    {
                      name: "Create Task", icon: "createTask.svg", onClick: (index) => {
                        setSelectedExpIndex(index)
                        const item = overalldata[index]
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

                    },
                    {
                      name: "Didn’t connect", icon: "didntconnect.svg", onClick: (index) => {
                        setSelectedExpIndex(index)
                        setdata({
                          ...data,
                          event_status: "Busy",
                          assignedTo: userTokenDetails?.user_id
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
                      }

                    },
                    {
                      name: "Not Interested", icon: "not_intrested.svg", onClick: (index) => {
                        setSelectedExpIndex(index)
                        const days = moment().format('YYYY-MM-DD')
                        const todaysdata = moment().add(7, "day").format('hh:mm')
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
                      }
                    },
                    {
                      name: "Marked as lost", icon: "marked_as_lost.svg", onClick: (index) => {
                        setSelectedExpIndex(index)
                        setdata({
                          ...data,
                          assignedTo: userTokenDetails?.user_id
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
                        let noteFor = overalldata[index]?.EXPORTER_NAME
                        toggleemailPopup({ data: item, show: true, selectedIndex: index, emailFor: noteFor })
                        setCurrentOverallEmailIds(item.EXTRA_DETAILS || [])
                        setCurrentEmailIds(item.EXTRA_DETAILS || [])
                      }

                    }
                  ]}
                />

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
  }
}
export default connect(mapStateToProps, null)(CRMDataComponent) 