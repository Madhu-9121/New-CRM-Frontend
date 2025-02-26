/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react'
import call from '../../service'
import { addDaysSkipSundays, decryptData, encryptData, ExportExcel, GetCache, isEmpty, isUserInactive, SetCache, subAdminDataDownloadLimit } from '../../utils/myFunctions'
import { NewTable } from '../../utils/newTable'
import Filter from '../InvoiceDiscounting/components/Filter'
import Pagination from '../InvoiceDiscounting/contract/components/pagination'
import UserDetails from './UserDetails'
import toastDisplay from '../../utils/toastNotification'
import { ToastContainer } from 'react-toastify'
import moment from 'moment'
import { NewInput, NewSelect, NewTextArea } from '../../utils/newInput'
import BottomPopup from '../TaskManager/BottomPopup'
import MultipleSelect from '../../utils/MultipleSelect'
import { reminders } from '../chatRoom/components/calenderView'
import { ExpandableTable } from '../wallet/components/ExpandableTable'
import FinanceInvoiceModal from '../InvoiceDiscounting/contract/components/financeinvoiceModal'
import SubAdminPopup from '../adminNewUI/SubAdminPopup'
import SendEmailPopup from '../TaskManager/SendEmailPopup'
import swal from 'sweetalert'
import GlobalSignup from '../adminNewUI/InvoiceLimit/globalSignup'
import CommodityAdd from '../registration/commodityAdd'
import { companyTypes, industryData } from '../registration/newRegistration';
import axios from 'axios'
import { platformBackendUrl } from '../../urlConstants'


const FieldTypes = [
  {
    name: 'Company', type: "finTech", typeId: 19, techType: 2,
    soleProprietorship: true, partnership: true, pvtPubLtd: true, llp: true, foreign: true
  },
  // {
  //   name: 'Importer', type: "finTech", typeId: 3, techType: 2,
  //   soleProprietorship: true, partnership: true, pvtPubLtd: true, llp: true, foreign: true
  // },
  {
    name: 'Banks/Finance/NBFC', type: 'finTech', typeId: 8, techType: 2,
    soleProprietorship: true, partnership: true, pvtPubLtd: true, llp: true, foreign: true, disabled: true
  },
  {
    name: 'Channel Partner', type: "CP", typeId: 20, techType: null,
    individual: true, soleProprietorship: true, partnership: true, pvtPubLtd: true, llp: true
  },
  {
    name: 'Franchise Partner', type: "FP", typeId: 20, techType: null,
    individual: true, soleProprietorship: true, partnership: true, pvtPubLtd: true, llp: true, disabled: true
  }
]

const formTitles = [
  { name: "Select your field" },
  { name: "Select your company type" },
  { name: "Enter your registration details" },
  { name: "Enter your company details" },
  { name: "Enter your personal details" }

]


const ExportersTab = ({ userTokenDetails, setHideTopBar }) => {
  const queryParams = new URLSearchParams(window.location.search)
  // let showDetailss = queryParams.get("showDetails")
  // if (showDetailss) {
  //   showDetailss = decodeURIComponent(showDetailss)
  //   showDetailss = JSON.parse(showDetailss)
  // }
  let showDetailss = sessionStorage.getItem("showDetailsForExporter")
  if (showDetailss) {
    // showDetailss = decodeURIComponent(showDetailss)
    showDetailss = JSON.parse(showDetailss)
  }
  const [data, setdata] = useState({})
  const [summarydata, setSummarydata] = useState({})
  const [filterData, setFilterData] = useState(GetCache("exporterTabFilterData"))
  const [refresh, setRefresh] = useState([])
  const [filter, setFilter] = useState(Object.keys(GetCache("exporterTabFilter")).length ? GetCache("exporterTabFilter") : { resultPerPage: 10, search: '' })
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [showLoader, setShowLoader] = useState(false)
  const [dbData, setDbData] = useState([])
  const [showDetails, setShowDetails] = useState(showDetailss || { isVisible: false, data: {} })
  const [errors, setErrors] = useState({})
  const [salesPerson, setSalesPerson] = useState([])
  const [filteredSearch, setFilteredSearch] = useState(GetCache("exporterTabSearchFilterData"))
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
  const [overalldata, setoveralldata] = useState([])
  const [isMinimized, setISMinimized] = useState(false)
  const [closeLeadPopup, setcloseLeadPopup] = useState(false)
  const [closeEventName, setcloseEventName] = useState('')
  const [searchedLocation, setSearchedLocation] = useState([])
  const [search, setSearch] = useState('')
  const [callHistoryPopup, toggleCallHistoryPopup] = useState({ show: false, data: [] })
  const [activeIndex, setActiveIndex] = useState(null);
  const [showdropdown, setshowdropdown] = useState(false)
  const [assignmentType, setAssignmentType] = useState('Single')
  const [selectedIndex, setSelectedIndex] = useState([])
  const [assignTaskLevel, setassignTaskLevel] = useState(0)
  const [assignType, setAssignType] = useState('Random')
  const [overallIndex, setoverallIndex] = useState([])
  const [subadminPopup, togglesubadminPopup] = useState({ data: [], show: false, userId: '' })
  const [CurrentOverallEmailIds, setCurrentOverallEmailIds] = useState([])
  const [CurrentEmailIds, setCurrentEmailIds] = useState([])
  const [emailPopup, toggleemailPopup] = useState({ show: false, data: {}, selectedIndex: null, emailFor: "" })

  const type_id = userTokenDetails?.type_id
  const userPermissionsForSubAdmin = JSON.parse(userTokenDetails.UserAccessPermission || "{}")
  const userId = userTokenDetails?.user_id
  let onlyShowForUserId = (userPermissionsForSubAdmin?.mainAdmin || userPermissionsForSubAdmin?.[`Exporter Complete`]) ? undefined : userId
  useEffect(() => {
    SetCache("exporterTabSearchFilterData", filteredSearch)
  }, [page, refresh, salesPerson, filteredSearch])
  const getexportersummaryAdmin = () => {
    setShowLoader(true)
    call('POST', 'getexportersummaryAdmin', { type_id: 19, sub_user_type_id: 21, onlyShowForUserId, }).then(result => {
      setSummarydata(result)
      setShowLoader(false)
    }).catch(e => {
      setShowLoader(false)
    })
  }


  console.log(userPermissionsForSubAdmin, "USer PErm for Sub admin---...")

  const getLocationSearch = () => {
    setShowLoader(true)
    call('POST', 'getLocationSearch', { search: search }).then(result => {
      setSearchedLocation(result)
      setShowLoader(false)
    }).catch(e => {
      setShowLoader(false)
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
  const handleAccordianClick = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };
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
    setDbData(tabledata)
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
    setDbData(tabledata)
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
    fillIndexes()
  }, [overallIndex])
  useEffect(() => {
    if (assignTaskLevel === 1) {
      updateTableRowsTicks()
    }
  }, [selectedIndex])
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
  const handleChange = async (event) => {
    if (event.persist) {
      event.persist()
    }


    if (event.target.name === "country" && event.target.value) {
      let tempSelectedCountry = countryData.filter((i) => {
        if (i.sortname === event.target.value) {
          return i
        }
      })?.[0] || {}
      setNewData({ ...newData, [event.target.name]: event.target.value, phoneCode: tempSelectedCountry.phonecode })
      setErrors({ ...errors, [event.target.name]: "" })
      return null
    }
    if (event.target.name === 'selectedCompanyName' && event.target.value) {
      let selectedCompany = searchedCompanys.filter((i) => {
        if (i.entityId === event.target.value) {
          return true
        }
      })?.[0] || {}
      setNewData({ ...newData, [event.target.name]: event.target.value, companyName: selectedCompany.primaryName })
      setErrors({ ...errors, [event.target.name]: "" })
      toggleMoreKYC(false)
      return null
    }
    if (event.target.name === "commodity" && event.target.value) {

      let tempSelectedCommodity = commodityDropDown.filter((i) => {
        if (i.id == event.target.value) {
          return i
        }
      })?.[0] || {}
      console.log("temp", tempSelectedCommodity, event.target.value)
      // setSelectedCommodity(tempSelectedCommodity)
      setNewData({ ...newData, [event.target.name]: event.target.value, id: tempSelectedCommodity.id })
      setErrors({ ...errors, [event.target.name]: "" })
      // console.log("....", e.target.name, "....", e.target.value, '......', tempSelectedCommodity.id)
      return null
    }
    if (event.target.name === "gstDocument" && FieldTypes[newData.workField]?.["typeId"] / 1 != 20) {
      if (!(newData.organizationType && companyTypes[newData.organizationType]["alt"] === "foreign")) {
        toggleMoreKYC(false)
      }
    }
    if (event.target.name === "contactNo") {
      toggleIsMobVerified(false)
    }
    if (event.target.name === "email") {
      toggleIsEmailVerified(false)
    }


    if (event.target.name === "contactPersonDropDown") {
      if (event.target.value === "Other") {
        setNewData({ ...newData, "contactPerson": "", [event.target.name]: event.target.value })
      }
      else {
        setNewData({ ...newData, "contactPerson": [event.target.value], [event.target.name]: event.target.value })
      }
    }
    else {
      setNewData({ ...newData, [event.target.name]: event.target.value })
      setdata(prev => ({
        ...prev,
        [event.target.name]: event.target.value
      }));
      setErrors({ ...errors, [event.target.name]: "" })
    }


    // setdata({ ...data, [event.target.name]: event.target.value })
    // setErrors({ ...errors, [event.target.name]: "" })
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
      setShowLoader(true)
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
      reqObj["EXPORTER_NAME"] = overalldata[selectedExpIndex]?.company_name
      call('POST', 'updateUserOnboardTask', reqObj).then(result => {
        toastDisplay(result, 'success')
        setShowLoader(false)
        handleClose()
        getExportersListForAdmin()
        setdata({})
        setcloseLeadPopup(false)
      }).catch(e => {
        toastDisplay(e, 'error')
        setShowLoader(false)
      })
    } else {
      setErrors(error)
    }

  }
  const updateLeadAssignedTo = (leadAssignedName, userId) => {
    call('POST', 'updateLeadAssignedTo', { leadAssignedName, userId }).then(result => {
      toastDisplay("Lead updated", "success")
      getExportersListForAdmin()
    }).catch(e => {
      toastDisplay("Failed to assign lead to " + leadAssignedName, "error")
    })
  }
  const getExportersListForAdmin = async (isDownload) => {
    if (isDownload) {
      if (!userPermissionsForSubAdmin.mainAdmin && dbData.length > subAdminDataDownloadLimit) {
        let action = `Download ${dbData.length} datasets from User Management > Exporter`
        let checkReqApiResp = await call('POST', 'checkActionRequestFromAdmin', { userId, action })
        if (!checkReqApiResp.accessGranted) {
          swal({
            title: "Are you sure!",
            text: `In order to download ${dbData.length} datasets, you need approval from admin, do you want to raise approval request for the same?`,
            icon: "warning",
            buttons: ["No", "Yes"],
            dangerMode: true,
          })
            .then(async (yes) => {
              if (yes) {
                let raiseReqApiResp = await call('POST', 'raiseActionRequestToAdmin', { userId, action })
                if (raiseReqApiResp.requestRaised) {
                  toastDisplay('Request raised successfully', 'success')
                }
                else if (raiseReqApiResp.requestAlreadyExists) {
                  toastDisplay('Request already exists', 'success')
                }
              }
            });
          return
        }
      }
    }
    setShowLoader(true)
    let reqObj = {
      resultPerPage: filter.resultPerPage,
      currentPage: page,
      search: filter.search,
      type_id: 19,
      sub_user_type_id: 21,
      onlyShowForUserId,
      ...filter
    }
    if (isDownload) {
      delete reqObj["resultPerPage"]
      delete reqObj["currentPage"]
    }

    for (let index = 0; index < Object.keys(filterData || {}).length; index++) {
      let filterName = Object.keys(filterData)[index]
      const element = filterData[filterName];
      if (element.isFilterActive) {
        if (element.type === "checkbox") {
          reqObj[element.accordianId] = []
          element["data"].forEach((i) => {
            if (i.isChecked) {
              reqObj[element.accordianId].push((element.accordianId === "status" || element.accordianId === "applicationStatus") ? i[element["labelName"]] : `'${i[element["labelName"]]}'`)
            }
          })
        }
        else if (element.type === "minMaxDate") {
          reqObj[element.accordianId] = element["value"]
        }
      }
    }
    if (reqObj["leadAssignedTo"]) {
      delete reqObj["onlyShowForUserId"]
    }
    call('POST', 'getExportersListForAdmin', reqObj).then(async result => {
      if (isDownload) {
        let downloadData = []
        for (let i = 0; i <= result.message.length - 1; i++) {
          let item = result.message[i]
          const downloadObj = {
            'EXPORTER NAME': item.company_name,
            'Contact Person': `${item.name_title ? item.name_title : ''} ${item.contact_person ? item.contact_person : ''}`,
            'Contact Number': `${item.phone_code ? "+" + item.phone_code : ''} ${item.contact_number ? item.contact_number : ''}`,
            'EMAIL ID': item.email_id,
            'Exporter Address': item.user_address,
            'Exporter City': item.company_city,
            'Assigned To': item.TaskAssignedToName
          }
          if (onlyShowForUserId) {
            delete downloadObj['Assigned To']
          }
          downloadData.push(downloadObj)
        }

        ExportExcel(downloadData, 'Exporter_List')
      } else {
        setDbData(formatDataForTable(result.message))
        setoveralldata(result.message)
        setCount(result.total_count)
        setassignTaskLevel(0)
        setSelectedIndex([])
        setdata({
          ...data,
          leadAssignedTo: null,
          leadAssignedToSec: null
        })
      }

      setShowLoader(false)
    }).catch(e => {
      setShowLoader(false)
    })
  }

  useEffect(() => {
    let isCacheExist = localStorage.getItem('exporterTabFilterData') != "{}"
    let isSearchCacheExist = localStorage.getItem('exporterTabSearchFilterData') != "{}"
    let reqObj = {
      resultPerPage: filter.resultPerPage,
      currentPage: page,
      search: filter.search,
      type_id: 19,
      sub_user_type_id: 21,
      onlyShowForUserId
    }

    call('POST', 'getUserManagementFiltersForAdmin', reqObj).then(res => {
      // console.log("getUserManagementFiltersForAdmin then", res);
      if (!isCacheExist) {
        setFilterData(res)
      }
      if (!isSearchCacheExist) {
        setFilteredSearch(res)
      }
    }).catch(err => { })
  }, [page, refresh, salesPerson])
  useEffect(() => {
    if (userPermissionsForSubAdmin.mainAdmin || userPermissionsForSubAdmin?.["Assign Task"]) {
      setShowLoader(true)
      call("POST", 'getSubAdminUser', {}).then(res => {
        setShowLoader(false)
        setSalesPerson(res.data)
      }).catch(err => setShowLoader(false))
    } else {
      setShowLoader(true)
      call("POST", 'getSubAdminUser', { onlyUserId: onlyShowForUserId }).then(res => {
        setShowLoader(false)
        setSalesPerson(res.data)
      }).catch(err => setShowLoader(false))
    }
  }, [])
  useEffect(() => {
    getexportersummaryAdmin()
  }, [])
  useEffect(() => {
    SetCache("exporterTabFilterData", filterData)
    SetCache("exporterTabFilter", filter)
    getExportersListForAdmin()
  }, [page, refresh, filterData, salesPerson])
  function formatDataForTable(data) {
    let tableData = []
    let row = []
    data.forEach((item, index) => {
      let isUserInActive = isUserInactive(item.last_login_at)
      row.push(<div className='cursor' onClick={async () => {
        setShowLoader(true)
        // console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii", item);
        await call("POST", 'checkKYCDetailsOfUser', { userId: item.tbl_user_id })
        setShowLoader(false)
        let tempObj = {
          isVisible: true,
          data: item
        }
        if (item.type_id / 1 == 21) {
          tempObj["data"] = {
            ...item,
            type_id: 19,
            id: item.parent_id,
            ttvExporterCode: item.parent_ttv_exporter_code,
            subUserProfileDetails: {
              type_id: item.type_id, id: item.id, parent_email_id: item.parent_email_id,
              contactPerson: item.contact_person, contact_number: item.contact_number,
              phone_code: item.phone_code, email_id: item.email_id
            }
          }
        }
        console.log("viewexpdetails=============>", tempObj);
        setShowDetails(tempObj)
        setHideTopBar(true)
      }} >
        <div>
          {item.type_id / 1 == 21 ? (
            <label className={"text-color1 font-size-10 font-wt-700"}>Subuser</label>
          ) : null}
        </div>
        <div>
          <label className={"text-color-label font-size-13 font-wt-600"}>
            {item.company_name}
          </label>
        </div>
      </div>)

      //row[0] =

      row.push(`${item.name_title ? item.name_title : ''} ${item.contact_person ? item.contact_person : ''}`)
      row.push(`${item.phone_code ? "+" + item.phone_code : ''} ${item.contact_number ? item.contact_number : ''}`)
      row.push(item.company_city ? item.company_city : '-')
      row.push(`${(item.notification_type && item.notification_type !== 'Other') ? item.notification_type : ""} ${item.notification_sub_type ? item.notification_sub_type : ""}`)
      row.push(<div class="w-100" >
        <label class="font-wt-600 font-size-13 cursor" onClick={() => {
          if (item.TaskAssignedToName) {
            togglesubadminPopup({
              show: true,
              data: [],
              userId: item.id
            })
          } else {
            setSelectedIndex([index])
            setshowdropdown(true)
          }

        }}>
          {item.TaskAssignedToName || '-'}
        </label>
      </div>)

      row.push(item.notification_description ? <span className='color3DB16F'>{item.notification_description}</span> :
        isUserInActive ? <span className='colorFE4141'>Inactive</span> : <span className='text2ECC71'>Active</span>)

      row.push(<span className='cursor' onClick={() => handleCallHistoryPopup(item)}>
        <span className='font-wt-600'>
          {item.LastEventTime ? moment(item.LastEventTime).format('DD/MM/YYYY') + ": " : ''}
        </span>
        <span className='font-wt-500'>
          {item.LastEventType ? item.LastEventType + "-" : ''}
        </span>
        <span className='font-wt-500' dangerouslySetInnerHTML={{ __html: item.LastNote ? item.LastNote.length > 60 ? item.LastNote.slice(0, 60) + "......." : item.LastNote : item.LAST_NOTE ? item.LAST_NOTE.length > 60 ? item.LAST_NOTE.slice(0, 60) + "......." : item.LAST_NOTE : '' }}>
        </span>
      </span>)

      row.push(
        <img src='/assets/images/redirect.svg' className='cursor'
          onClick={
            async () => {
              setShowLoader(true)
              await call("POST", 'checkKYCDetailsOfUser', { userId: item.tbl_user_id })
              setShowLoader(false)
              let tempObj = {
                isVisible: true,
                data: item
              }
              if (item.type_id / 1 == 21) {
                tempObj["data"] = {
                  ...item,
                  type_id: 19,
                  id: item.parent_id,
                  ttvExporterCode: item.parent_ttv_exporter_code,
                  subUserProfileDetails: {
                    type_id: item.type_id, id: item.id, parent_email_id: item.parent_email_id,
                    contactPerson: item.contact_person, contact_number: item.contact_number,
                    phone_code: item.phone_code, email_id: item.email_id
                  }
                }
              }
              console.log("viewexpdetails=============>", tempObj);
              // tempObj = JSON.stringify(tempObj)
              if (tempObj) {
                sessionStorage.setItem("showDetailsForExporter", JSON.stringify(tempObj));
                window.location = `/usersonboard?tab=Exporter&showDetails=true&hideTopBar=true`
              }
            }} />)
      tableData.push(row)
      row = []
    })
    return tableData
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
    setShowLoader(true)
    let apiResp = await call('POST', 'getUserOnboardedHistory', {
      EXPORTER_CODE: itemData.id
    })
    // console.log("getTransactionHistoryForInvoiceLimit api resp====>", itemData, apiResp);
    setShowLoader(false)
    toggleCallHistoryPopup({ show: true, data: apiResp })
  }
  const AssignUsersInBulkV2 = (assingeeId, assignedIdSec) => {
    let exporterArr = []
    for (let i = 0; i <= selectedIndex.length - 1; i++) {
      const index = selectedIndex[i]
      exporterArr.push(overalldata[index].id)
    }
    let reqObj = {
      USER_IDS: exporterArr,
      LeadAssignedTo: assingeeId,
      SecondaryLeadAssignedTo: assignedIdSec
    }
    setShowLoader(true)
    console.log('API REQ', reqObj);
    call('POST', 'AssignUsersInBulkV2', reqObj).then(result => {
      toastDisplay(result, "success")
      setShowLoader(false)
      getExportersListForAdmin()
      setshowdropdown(false)
    }).catch(e => {
      setShowLoader(false)
      toastDisplay(e, "error")
    })
  }


  const [selectSupplierPopup, setselectSupplierPopup] = useState(false)
  const [boolsignup, setboolsignup] = useState(false)
  const [suppliers, setsuppliersdata] = useState([])
  const [suppliersoverall, setsuppliersdataoverall] = useState([])
  const [supplierName, setSupplierName] = useState('')
  const [countrys, setCountrys] = useState([])

  const [financiersData, setfinanciersData] = useState([])
  const [outsideIndiaOrg, setoutSideIndiaOrg] = useState("no")
  const [newData, setNewData] = useState({
    nameTitle: "Mr", phoneCode: "91", tcAccept: false,
    designation: "Director"
  })
  const [stepperProgress, updateStepperProgress] = useState(0);
  const [searchedCompanys, setSearchedCompanys] = useState([])

  const [showMoreKYC, toggleMoreKYC] = useState(false)
  const [commodityDropDown, setCommodityDropDown] = useState([])
  const [countryData, setcountryData] = useState([]);
  const [isEmailVerified, toggleIsEmailVerified] = useState(false);
  const [isMobVerified, toggleIsMobVerified] = useState(false);
  const [panArr, setPanArr] = useState([])
  useEffect(() => {
    axios.get(platformBackendUrl + "/getallCountry").then((result) => {
      if (result.data.message && result.data.message.length) {
        setcountryData(result.data.message);
      }
    });

    call('GET', 'getcommoditycategory')
      .then(result => {
        if (result && result.length) {
          setCommodityDropDown(result);
        }
      })
      .catch(error => {
        console.error("Error in fetching commodity categories", error);

      });
  }, []);
  const handleStepperProgress = (type) => {
    type === "inc" ? updateStepperProgress(stepperProgress + 1) : updateStepperProgress(stepperProgress - 1)
  }
  let userIdToOnboard = queryParams.get("user")

  const onRegister = () => {
    let reqObject = {
      "typeId": FieldTypes[newData.workField]["typeId"],
      "cinDocumentName": newData.cinDocument || null,
      "gstDocumentName": newData.gstDocument || null,
      "iecDocumentName": newData.iecDocument || null,
      "panDocumentName": newData.panDocument || null,
      "aadharDocumentName": newData.aadharDocument || null,
      "organizationType": companyTypes[newData.organizationType]["alt"],
      "companyName": newData.companyName,
      "contactPerson": newData.contactPerson,
      "companyAddress": newData.companyAddress,
      "email": newData.email,
      "contactNo": newData.contactNo,
      "gst_company_detail": newData.gst_company_detail || null,
      "iec_company_detail": newData.iec_company_detail || null,
      "cin_company_detail": newData.cin_company_detail || null,
      "type": FieldTypes[newData.workField]["type"],
      "referralCode": newData.referalCode,
      "password": newData.password,
      "passwordConfirm": newData.repassword,
      "termsAndCondition": true,
      "country": newData.country,
      "industryType": newData.industryType,
      "techType": FieldTypes[newData.workField]["techType"],
      "companyCity": newData.companyCity,
      "companyPostalCode": newData.companyPostalCode,
      "phoneCode": newData.phoneCode,
      "nameTitle": newData.nameTitle,
      "companyState": newData.companyState,
      "designation": newData.designation
    };

    if (userIdToOnboard) {
      reqObject["userIdToOnboard"] = decodeURIComponent(decryptData(userIdToOnboard));
    }
    if (FieldTypes[newData.workField]["typeId"] === 20) {
      reqObject["adminProfile"] = false;
      reqObject["finTechType"] = true;
      reqObject["role"] = FieldTypes[newData.workField]["type"];
      reqObject["status"] = 1;
      if (newData.country != "IN") {
        reqObject["setKycTrue"] = true;
      }
      setShowLoader(true);
      console.log("req obj", reqObject)
      call('POST', 'registration', reqObject).then((result) => {
        setShowLoader(false)
        toastDisplay("Operation success, contact admin for next process", "success")
        setTimeout(() => {
          window.location = 'login'
        }, 1500);
      }).catch(err => {
        setShowLoader(false)
        toastDisplay("Something went wrong", "error");
      })
    }
    else {
      let formData = new FormData()
      Object.keys(reqObject).forEach(item => {
        formData.append(item, reqObject[item])
      })
      if (commodityList.length) {
        formData.append('commodityList', JSON.stringify(commodityList))
      }
      setShowLoader(true)
      call('POST', 'registration', formData).then((result) => {
        setShowLoader(false)
        setboolsignup(false)
        setRefresh(prev => prev + 1)
        toastDisplay("User registered successfully", "success")

      }).catch(err => {
        setShowLoader(false)
        toastDisplay(err.message || "Something went wrong", "error");

      })
      setboolsignup(false)
      // setRefresh(prev => prev + 1)
      // getExportersListForAdmin()

    }
  }

  const handleFilterOptions = async (typedInput, name) => {
    // console.log("typedInput", typedInput);
    if (name === "selectedCompanyName" && typedInput) {
      let entitySearchApiResp = await call('POST', 'searchEntity', { supplierName: typedInput })
      if (entitySearchApiResp?.length) {
        setSearchedCompanys([...entitySearchApiResp])
      }
    }
  }

  const handleNext = async () => {
    let err = {}
    if (stepperProgress === 0 && !FieldTypes[data.workField]) {
      err["msg"] = "Select work field"
    }
    else if (stepperProgress === 0) {
      if (outsideIndiaOrg === "yes") {
        return updateStepperProgress(3)
      }
      else {
        return updateStepperProgress(2)
      }
    }
    // if (stepperProgress === 1 && !companyTypes[data.organizationType]) {
    //   err["msg"] = "Select company type"
    // }
    if (stepperProgress === 2) {
      if (showMoreKYC) {
        let validateFields = []
        let isChannelPartner = FieldTypes[newData.workField]?.["typeId"] / 1 == 20
        // console.log("organizationTypeeeeeeeeeeeeeeeeeee", data.organizationType);
        if (!newData?.organizationType?.toString()?.length) {
          return setErrors({ ...errors, organizationType: "Mandatory Field" })
        }
        else {
          if (companyTypes[newData.organizationType]["alt"] === "individual") {
            validateFields = ["aadharDocument", "panDocument"]
          }
          if (companyTypes[newData.organizationType]["alt"] === "soleProprietorship" && !isChannelPartner) {
            // validateFields = ["iecDocument"]
          }
          if (companyTypes[newData.organizationType]["alt"] === "partnership" && !isChannelPartner) {
            // validateFields = ["iecDocument"]
          }
          if (companyTypes[newData.organizationType]["alt"] === "pvtPubLtd" && !isChannelPartner) {
            validateFields = ["cinDocument"]
          }
          if (companyTypes[newData.organizationType]["alt"] === "llp" && !isChannelPartner) {
            // validateFields = ["iecDocument"]
          }
        }
        for (let index = 0; index < validateFields.length; index++) {
          const element = validateFields[index];
          if (!newData[element]) {
            err[element] = "Mandatory field"
          }
        }
      }
      else {
        let isIndividualCompany = companyTypes?.[newData.organizationType]?.["alt"] === "individual"
        let isChannelPartner = FieldTypes[newData.workField]?.["typeId"] / 1 == 20
        if (!isIndividualCompany && !newData.gstDocument && !isChannelPartner && !newData.selectedCompanyName) {
          err["gstDocument"] = "Enter GST Number"
        }
        else if (isChannelPartner && !newData.panDocument) {
          err["panDocument"] = "Enter PAN Number"
        }
        else {
          setShowLoader(true)
          try {
            let apiResp = await call('POST', 'getAndVerifyKYCV2', isChannelPartner ?
              { "pan": newData.panDocument, typeId: FieldTypes[newData.workField]?.["typeId"] / 1 } :
              {
                "gst": newData.gstDocument || undefined, typeId: FieldTypes[newData.workField]?.["typeId"] / 1,
                "entityId": newData.gstDocument ? undefined : newData.selectedCompanyName
              })
            setShowLoader(false)
            if (apiResp) {
              let addressComponents = {}
              setShowLoader(true)
              if (apiResp?.company_address?.length) {
                addressComponents = await call('POST', 'getAddressComponents', { address: apiResp.company_address })
              }
              setShowLoader(false)
              let tempMultPanArr = []
              for (let index = 0; index < apiResp.multiplePans?.length; index++) {
                tempMultPanArr.push({ name: apiResp.multiplePans[index] })
              }
              setPanArr(tempMultPanArr)
              // setNewData({
              //   ...newData,
              //   gstDocument: data.gstDocument || apiResp?.gst,
              //   iecArr: apiResp.iecArr,
              //   organizationType: mapOrganizationTypeWithKarza(apiResp.organizationType),
              //   iecDocument: apiResp.iecArr?.[0]?.["iec"] || null,
              //   panDocument: isChannelPartner ? data.panDocument : apiResp.pan, cinDocument: apiResp.cin || null,
              //   "companyName": apiResp.company_name,
              //   "contactPerson": apiResp.company_name,
              //   "companyAddress": apiResp.company_address,
              //   "companyCity": addressComponents.city,
              //   "companyPostalCode": addressComponents.postalCode,
              //   "country": addressComponents.countrySortName,
              //   "companyState": addressComponents.state,
              //   "gst_company_detail": null,
              //   "iec_company_detail": null,
              //   "cin_company_detail": null,
              //   "type": "finTech",
              //   categoryOfExporters: apiResp?.categoryOfExporters
              // })
              toggleMoreKYC(true)
              return null
            }
          } catch (error) {
            console.log("e", error);
            toggleMoreKYC(true)
            // setShowLoader(false)
            toastDisplay(error, "error")
            return null
          }
        }
      }
    }
    if (stepperProgress === 3) {
      let validateFields = ["companyName", "country", "companyAddress", "companyCity", "companyPostalCode"]
      for (let index = 0; index < validateFields.length; index++) {
        const element = validateFields[index];
        if (!newData[element]) {
          err[element] = "Mandatory field"
        }
      }
    }
    // #2
    // if (stepperProgress === 4) {
    //   let validateFields = ["contactPersonDropDown", "contactPerson", "nameTitle", "email", "contactNo", "designation"]
    //   if (!typeId) {
    //     if (!isEmailVerified) {
    //       err["email"] = "Kindly verify email id to proceed"
    //       sendCombinedOTP()
    //     }
    //     else if (!isMobVerified) {
    //       err["contactNo"] = "Kindly verify mobile number to proceed"
    //       sendCombinedOTP()
    //     }
    //   }

    //   for (let index = 0; index < validateFields.length; index++) {
    //     const element = validateFields[index];
    //     if (!data[element]) {
    //       err[element] = "Mandatory field"
    //     }
    //   }
    // }
    // if (stepperProgress === 5) {
    //   let validateFields = ["password", "repassword"]
    //   if (newData.password && newData.password.length < 6) {
    //     err["password"] = "Password should be atleast 6 characters long"
    //   }
    //   else if (newData.password != newData.repassword) {
    //     err["repassword"] = "Password mismatch"
    //   }
    //   for (let index = 0; index < validateFields.length; index++) {
    //     const element = validateFields[index];
    //     if (!newData[element]) {
    //       err[element] = "Mandatory field"
    //     }
    //   }
    // }
    if (!Object.keys(err).length) {
      if (stepperProgress == 4) {
        onRegister()
      }
      // else if (stepperProgress == 2) {
      //   let req = {
      //     "organizationType": companyTypes[data.organizationType]["alt"],
      //     "cinDocumentName": data["cinDocument"],
      //     "gstDocumentName": data["gstDocument"],
      //     "iecDocumentName": data["iecDocument"]
      //   }
      //   if (req.organizationType != "foreign" && req.organizationType != "individual") {
      //     setShowLoader(true)
      //     call('POST', 'getKYCDetail', req).then((result) => {
      //       // console.log("getKYCDetail==>", result);
      //       if (result.company_name != '') {
      //         setData({
      //           ...data,
      //           "companyName": result.company_name,
      //           "contactPerson": result.company_name,
      //           "companyAddress": result.company_address,
      //           "email": result.company_email,
      //           "contactNo": result.company_mobile,
      //           "gst_company_detail": result.gst_company_detail ? result.gst_company_detail : null,
      //           "iec_company_detail": result.iec_company_detail ? result.iec_company_detail : null,
      //           "cin_company_detail": result.cin_company_detail ? result.cin_company_detail : null,
      //           "type": "finTech"
      //         });
      //         toastDisplay("KYC verified successfully", "success");
      //         handleStepperProgress("inc")
      //       }
      //       else {
      //         toastDisplay("Your KYC is Not-Verified", "error");
      //       }
      //       setShowLoader(false)
      //     }).catch((e) => {
      //       setShowLoader(false)
      //       toastDisplay("Something went wrong", "error");
      //     })
      //   }
      //   else {
      //     handleStepperProgress("inc")
      //   }
      // }
      else {
        handleStepperProgress("inc")
      }
    }
    else {
      if (stepperProgress != 3) {
        toastDisplay(err["msg"] || "Form validation error", "error")
      }
    }
    // console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", err);
    setErrors(err)
  }


  const handleFieldChange = (index, type) => {
    if (type === "workField") {
      setNewData({ ...newData, [type]: index, organizationType: outsideIndiaOrg === "yes" ? 5 : null })
    }
    else {
      setNewData({ ...newData, [type]: index })
    }
  }


  const [additionalCommodity, setAdditionalCommodity] = useState([]);
  const [addMorecommodity, setAddMoreCommodity] = useState(false)
  const [commodityList, setCommodityList] = useState([])
  const onCancel = (selectedCommodityId, commodityName) => {

    const temp = commodityDropDown.find(item => parseInt(item.id) === parseInt(selectedCommodityId));
    const filteredItems = []
    for (let i of commodityList) {
      if (i.commdCategory !== temp.category && i.commodityName !== commodityName) {
        filteredItems.push(i)
      }
    }
    console.log("filteredItems....", filteredItems)
    setCommodityList(filteredItems)

    // const filteredItems = commodityList.filter(item => item.commdCategory !== temp.category && item.commodityName !== commodityName);
    console.log(filteredItems)
    setCommodityList(filteredItems)


  }


  const onPlus = (id, name) => {
    if (id && name) {

      const temp = commodityDropDown.find(item => parseInt(item.id) === parseInt(id));
      console.log("temp item in add", temp)

      const obj = { category_id: id, commodity_name: name, commodity_pretty_name: name.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) }
      console.log("object added", obj)
      setCommodityList(prev => [...prev, obj])

      setAddMoreCommodity(true)
    }
    else {
      return
    }
  }
  useEffect(() => { console.log("in use Efeect", commodityList) }, [commodityList])

  const handleAddMore = () => {
    setAdditionalCommodity(prev => [...prev, <CommodityAdd commodityDropDown={commodityDropDown} onPlus={onPlus} setAddMoreCommodity={setAddMoreCommodity} onCancel={onCancel} />])
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

  }, [])

  return (
    <>
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
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
      {showDetails.isVisible &&
        <div className='mt-4'>
          <UserDetails data={showDetails.data} goBack={() => {
            setShowDetails({
              isVisible: false,
              data: {}
            })
            setHideTopBar(false)
          }} userTokenDetails={userTokenDetails} />
        </div>

      }
      <SubAdminPopup togglesubadminpopup={togglesubadminPopup} subadminpopup={subadminPopup} setShowLoader={setShowLoader} refreshtable={getExportersListForAdmin} />
      {emailPopup.show &&
        <SendEmailPopup emailPopup={emailPopup} toggleemailPopup={toggleemailPopup} CurrentEmailIds={CurrentEmailIds} userId={userId} CurrentOverallEmailIds={CurrentOverallEmailIds} setCurrentOverallEmailIds={setCurrentOverallEmailIds} setCurrentEmailIds={setCurrentEmailIds} type={"TRF Admin"} EXPORTER_CODE={emailPopup.data.id} EXPORTER_NAME={emailPopup.data.company_name} userName={userTokenDetails?.userName} successHandler={getExportersListForAdmin} />
      }
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

      {!showDetails.isVisible &&
        <div className="row gap-3 mt-4">
          {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
          <div className="w-15">
            <div className="card py-1 px-4 dashboard-card border-0 borderRadius h-100 justify-content-center me-3">
              <p className='dasboard-count d-block text-center mb-0 text-color1 mb-1 font-size-22'>{summarydata.total_exporters ? summarydata.total_exporters : 0}</p>
              <label className='dashboard-name d-block text-center mb-0 cursor font-size-16 font-wt-600'>Exporters  </label>
            </div>
          </div>
          <div className="w-22">
            <div className="card py-1 px-4 dashboard-card border-0 borderRadius justify-content-center h-100  me-3">
              <label className='dasboard-count mb-1 font-size-14 font-wt-500'>Status</label>
              <div className='d-flex flex-row justify-content-between'>
                <div className='d-flex flex-column cursor'
                  onClick={() => {
                    let temp = filterData
                    temp["Status"]["data"][0]["isChecked"] = true
                    temp["Status"]["data"][1]["isChecked"] = false
                    temp["Status"]["isFilterActive"] = true
                    setFilterData({ ...temp })
                  }}
                >
                  <label className='font-size-22 text-color1 font-wt-600 cursor'>{summarydata.active_exporters ? summarydata.active_exporters : 0}</label>
                  <label className='font-size-16 font-wt-600 cursor'>Active</label>
                </div>
                <div className='d-flex flex-column cursor'
                  onClick={() => {
                    let temp = filterData
                    temp["Status"]["data"][0]["isChecked"] = false
                    temp["Status"]["data"][1]["isChecked"] = true
                    temp["Status"]["isFilterActive"] = true
                    setFilterData({ ...temp })
                  }}
                >
                  <label className='font-size-22 font-wt-600 colorFF7B6D cursor'>{summarydata.inactive_exporters ? summarydata.inactive_exporters : 0}</label>
                  <label className='font-size-16 font-wt-600 cursor'>InActive</label>
                </div>
              </div>

            </div>
          </div>
          <div className="col-md-6 ">
            <div className="card py-1 px-4 dashboard-card border-0 borderRadius justify-content-center h-100 mx-0">
              <label className="dasboard-count mb-1 font-size-14 font-wt-500">Ongoing applications</label>
              <div className="d-flex justify-content-between mt-1">
                <div className='cursor'
                  onClick={() => {
                    let temp = filterData
                    temp["Application Status"]["data"][0]["isChecked"] = true
                    temp["Application Status"]["data"][1]["isChecked"] = false
                    temp["Application Status"]["data"][2]["isChecked"] = false
                    temp["Application Status"]["isFilterActive"] = true
                    setFilterData({ ...temp })
                  }}
                >
                  <p className='dasboard-count text-color1 font-size-22 mb-1 font-wt-600 cursor'>{summarydata.total_limit_count ? summarydata.total_limit_count : 0}</p>
                  <label className='dashboard-name cursor font-wt-600'> Limit Application </label>
                </div>
                <div className='cursor'
                  onClick={() => {
                    let temp = filterData
                    temp["Application Status"]["data"][0]["isChecked"] = false
                    temp["Application Status"]["data"][1]["isChecked"] = true
                    temp["Application Status"]["data"][2]["isChecked"] = false
                    temp["Application Status"]["isFilterActive"] = true
                    setFilterData({ ...temp })
                  }}>
                  <p className='dasboard-count text-color1 font-size-22 mb-1 font-wt-600 cursor'>{summarydata.total_finance_count ? summarydata.total_finance_count : 0}</p>
                  <label className='dashboard-name cursor font-wt-600'> Finance Application </label>
                </div>
                <div className='cursor'
                  onClick={() => {
                    let temp = filterData
                    temp["Application Status"]["data"][0]["isChecked"] = false
                    temp["Application Status"]["data"][1]["isChecked"] = false
                    temp["Application Status"]["data"][2]["isChecked"] = true
                    temp["Application Status"]["isFilterActive"] = true
                    setFilterData({ ...temp })
                  }}>
                  <p className='dasboard-count colorFF7B6D font-size-22 mb-1 font-wt-600 cursor'>{summarydata.total_rejected_count ? summarydata.total_rejected_count : 0}</p>
                  <label className='dashboard-name cursor font-wt-600'> Rejected Application </label>
                </div>
              </div>
            </div>
          </div>
          <div className='my-0'>
            <div className='filter-div ml-4 '>
              <Filter
                filteredSearch={filteredSearch}
                setFilteredSearch={setFilteredSearch}
                filterData={filterData} setFilterData={setFilterData} showFilterBtn={true}
                showResultPerPage={true} count={count} filter={filter} setFilter={setFilter} refresh={refresh} setRefresh={setRefresh} showDownloadIcon onDownloadClick={() => { getExportersListForAdmin(true) }} isAdditionalButton={true} valushowSelectOption={assignTaskLevel >= 1} setAssignType={setAssignType}>

                <div className="d-flex gap-4 align-items-center ml-1">
                  <img src='/assets/images/assign_text_icon.svg' onClick={() => {
                    if (assignTaskLevel >= 1) {
                      //open popup
                      setshowdropdown(!showdropdown)
                      console.log('showdropdown');
                    } else {
                      setassignTaskLevel(assignTaskLevel + 1)
                    }
                  }} />
                  <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={() => setboolsignup(true)}>Add New</button>
                </div>
              </Filter>
            </div>

            {boolsignup && <GlobalSignup

              stepperProgress={stepperProgress}

              formTitles={formTitles}
              FieldTypes={FieldTypes}
              handleFieldChange={handleFieldChange}
              handleStepperProgress={handleStepperProgress}
              updateStepperProgress={updateStepperProgress}
              outsideIndiaOrg={outsideIndiaOrg}
              setoutSideIndiaOrg={setoutSideIndiaOrg}
              newData={newData}
              setNewData={setNewData}
              errors={errors}
              countryData={countryData}
              industryData={industryData}
              additionalCommodity={additionalCommodity}
              addMorecommodity={addMorecommodity}
              handleAddMore={handleAddMore}
              onPlus={onPlus}
              onCancel={onCancel}
              boolsignup={boolsignup}
              setboolsignup={setboolsignup}
              handleChange={handleChange}
              companyTypes={companyTypes}
              searchedCompanys={searchedCompanys}
              handleFilterOptions={handleFilterOptions}
              showMoreKYC={showMoreKYC}
              panArr={panArr}
              commodityDropDown={commodityDropDown}
              isEmailVerified={isEmailVerified}
              handleNext={handleNext}
              setsuppliersdataoverall={setsuppliersdataoverall}
              setsuppliersdata={setsuppliersdata}
              setSupplierName={setSupplierName}

            />}

            <div>
              <ExpandableTable
                filterData={filterData}
                setFilterData={setFilterData}
                filteredSearch={filteredSearch}
                setFilteredSearch={setFilteredSearch}
                overalldata={overalldata}
                expand={[]}
                tableExpand={[]}
                expandKey={"id"}
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
                    } />, width: '2%'
                  },
                  {
                    name: "Company", width: '10%', filter: true, filterDataKey: "Exporter Name", sort: [
                      { name: "Sort A-Z", selected: filter.sortCompanyName === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: 'ASC', sortContactPerson: false, sortCompanyCity: false, sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } },
                      { name: "Sort Z-A", selected: filter.sortCompanyName === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: 'DESC', sortContactPerson: false, sortCompanyCity: false, sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } }]
                  },
                  {
                    name: "Contact person", width: '10%', filter: true, filterDataKey: "Contact Person", sort: [
                      { name: "Sort A-Z", selected: filter.sortContactPerson === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: 'ASC', sortCompanyCity: false, sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } },
                      { name: "Sort Z-A", selected: filter.sortContactPerson === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: 'DESC', sortCompanyCity: false, sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } }]
                  },
                  {
                    name: "Contact no.", width: '10%', filter: true, filterDataKey: "Contact Number"
                  },
                  {
                    name: "City", width: '8%', filter: true, filterDataKey: "Company City", sort: [
                      { name: "Sort A-Z", selected: filter.sortCompanyCity === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: 'ASC', sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } },
                      { name: "Sort Z-A", selected: filter.sortCompanyCity === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: 'DESC', sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } }]
                  },
                  { name: "Type", width: '10%' },
                  {
                    name: "Admin", width: '10%', filter: true, filterDataKey: "Lead Assigned To", sort: [
                      { name: "Sort A-Z", selected: filter.sortLeadAssignedTo === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: false, sortLeadAssignedTo: 'ASC', sortByDate: false }); setRefresh(refresh + 1) } },
                      { name: "Sort Z-A", selected: filter.sortLeadAssignedTo === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: false, sortLeadAssignedTo: 'DESC', sortByDate: false }); setRefresh(refresh + 1) } }]
                  },
                  {
                    name: "Status", width: '10%', filter: true, filterDataKey: "StatusFilter", sort: [
                      { name: "Sort Oldest", selected: filter.sortByDate === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: false, sortByDate: 'ASC', sortLeadAssignedTo: false }); setRefresh(refresh + 1) } },
                      { name: "Sort Latest", selected: filter.sortByDate === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: false, sortByDate: 'DESC', sortLeadAssignedTo: false }); setRefresh(refresh + 1) } }]
                  },
                  {
                    name: "Remark", width: '18%',
                  },
                  { name: "", width: '2%', }
                ]
                  :
                  [
                    {
                      name: "Company", width: '10%', filter: true, filterDataKey: "Exporter Name", sort: [
                        { name: "Sort A-Z", selected: filter.sortCompanyName === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: 'ASC', sortContactPerson: false, sortCompanyCity: false, sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } },
                        { name: "Sort Z-A", selected: filter.sortCompanyName === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: 'DESC', sortContactPerson: false, sortCompanyCity: false, sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } }]
                    },
                    {
                      name: "Contact person", width: '10%', filter: true, filterDataKey: "Contact Person", sort: [
                        { name: "Sort A-Z", selected: filter.sortContactPerson === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: 'ASC', sortCompanyCity: false, sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } },
                        { name: "Sort Z-A", selected: filter.sortContactPerson === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: 'DESC', sortCompanyCity: false, sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } }]
                    },
                    {
                      name: "Contact no.", width: '10%', filter: true, filterDataKey: "Contact Number"
                    },
                    {
                      name: "City", width: '10%', filter: true, filterDataKey: "Company City", sort: [
                        { name: "Sort A-Z", selected: filter.sortCompanyCity === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: 'ASC', sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } },
                        { name: "Sort Z-A", selected: filter.sortCompanyCity === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: 'DESC', sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } }]
                    },
                    { name: "Type", width: '10%' },
                    {
                      name: "Admin", width: '10%', filter: true, filterDataKey: "Lead Assigned To", sort: [
                        { name: "Sort A-Z", selected: filter.sortLeadAssignedTo === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: false, sortLeadAssignedTo: 'ASC', sortByDate: false }); setRefresh(refresh + 1) } },
                        { name: "Sort Z-A", selected: filter.sortLeadAssignedTo === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: false, sortLeadAssignedTo: 'DESC', sortByDate: false }); setRefresh(refresh + 1) } }]
                    },
                    {
                      name: "Status", width: '10%', filter: true, filterDataKey: "StatusFilter", sort: [
                        { name: "Sort Oldest", selected: filter.sortByDate === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: false, sortByDate: 'ASC', sortLeadAssignedTo: false }); setRefresh(refresh + 1) } },
                        { name: "Sort Latest", selected: filter.sortByDate === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: false, sortByDate: 'DESC', sortLeadAssignedTo: false }); setRefresh(refresh + 1) } }]
                    },
                    {
                      name: "Remark", width: '18%',
                    },
                    { name: "", width: '2%', }
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
                        contact_person: item.contact_person,
                        contact_number: item.contact_number,
                        event_type: "Call",
                        event_status: "Hot (30 days or less)",
                        event_date: moment(days).format('YYYY-MM-DD'),
                        event_time: todaysdata,
                        reminder: "30 minutes",
                        assignedTo: userTokenDetails?.user_id,
                        remark: ''
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
                        contact_person: item.contact_person,
                        contact_number: item.contact_number,
                        remark: ''
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
                        contact_person: item.contact_person,
                        contact_number: item.contact_number,
                        remark: ''
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
                        contact_person: item.contact_person,
                        contact_number: item.contact_number,
                        remark: ''
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
                        contact_person: item.contact_person,
                        contact_number: item.contact_number,
                        remark: ''
                      })
                      setisOpenLost({
                        isVisible: true,
                        selectedIndex: index
                      })
                    }
                  },
                  {
                    name: "Send Mail", icon: "mail.png", onClick: (index) => {
                      const item = overalldata[index]
                      let noteFor = overalldata[index]?.company_name
                      toggleemailPopup({ data: item, show: true, selectedIndex: index, emailFor: noteFor })
                      setCurrentOverallEmailIds([{ "Email ID": item.email_id }])
                      setCurrentEmailIds([{ "Email ID": item.email_id }])
                    }

                  }
                ]}


                data={dbData} />
              <Pagination page={page} perPage={filter.resultPerPage} totalCount={count} onPageChange={(p) => setPage(p)} refresh={refresh} setRefresh={setRefresh} />

            </div>
          </div>
        </div>}
    </>
  )
}

export default ExportersTab