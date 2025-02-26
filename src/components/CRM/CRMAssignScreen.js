import React, { createRef, useCallback, useRef } from 'react'
import { useState } from 'react'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import HeaderV2 from '../partial/headerV2'
import SideBarV2 from '../partial/sideBarV2'
import call from '../../service'
import { useEffect } from 'react'
import Pagination from '../InvoiceDiscounting/contract/components/pagination'
import { NewTable } from '../../utils/newTable'
import Filter from '../InvoiceDiscounting/components/Filter'
import toastDisplay from '../../utils/toastNotification'
import CustomLineChart from './CustomLineChart'
import FinanceInvoiceModal from '../InvoiceDiscounting/contract/components/financeinvoiceModal'
import { InputWithSelect, NewInput, NewSelect } from '../../utils/newInput'
import { ExportExcel, getContactObject, getFiscalYearsDropdown, isEmpty } from '../../utils/myFunctions'
import moment from 'moment'
import axios from 'axios'
import { platformBackendUrl, platformURL } from '../../urlConstants'
import { ExpandableTable } from '../wallet/components/ExpandableTable'
const fiscalyears = getFiscalYearsDropdown()

const turnoverRange = [
  { min: "0", max: '100,000', is_checked: true, minVal: 0, maxVal: 100000 },
  { min: "100,000", max: '1 Million', is_checked: true, minVal: 100000, maxVal: 1000000 },
  { min: "1 Million", max: '5 Million', is_checked: true, minVal: 1000000, maxVal: 5000000 },
  { min: "5 Million", max: '10 Million', is_checked: true, minVal: 5000000, maxVal: 10000000 },
  { min: "10 Million", max: 'More', is_checked: true, maxVal: 10000000 }
]
const bardataConfig = [
  { dataKey: "total_exporters", fill: "#2ECC71", display: 'country' },
  { dataKey: "total_buyers", fill: "#5CB8D3", display: 'country' },
]

const valuesConfig = [
  { dataKey: "total_fob", fill: "#2ECC71", display: 'country' },
]

const label = {
  "total_exporters": "Exporters",
  "total_buyers": "Buyers",
}

const graphdropdown = [
  { label: 'Top 10 Countries', key: 'DESTINATION_COUNTRY' },
  { label: 'Top 10 HSN Code', key: 'HS_CODE' },
  { label: 'Top 10 Commodities', key: 'Commodities' },
  { label: 'Top 10 Exporters', key: 'EXPORTER_NAME' },
  { label: 'Top 10 Port of loading', key: 'SOURCE_PORT' },
  { label: 'Top 10 Port of discharge', key: 'DESTINATION_PORT' },
  { label: 'Top 10 Buyers', key: 'CONSIGNEE_NAME' }
]

const allfilters = [
  { name: "Exporters", filterKey: "IMPEXP", filterCount: 0 },
  { name: "Available Contacts", filterKey: "AvailContacts", filterCount: 0 },
  { name: "Turnover", filterKey: "turnover", filterCount: 0 },
  { name: "Region", filterKey: "region", filterCount: 0 },
  { name: "CRM", filterKey: "crm", filterCount: 0 },
  { name: "Organization Type", filterKey: "orgType", filterCount: 0 },
  { name: "Export Countries", filterKey: "exportCountries", filterCount: 0 },
  { name: "Clients", filterKey: "clientsType", filterCount: 0 },
  { name: "More Filters", filterKey: "morefilter", filterCount: 0 }
]

const allfiltersBuyers = [
  { name: "Buyers", filterKey: "IMPEXP", filterCount: 0 },
  { name: "Available Contacts", filterKey: "AvailContacts", filterCount: 0 },
  { name: "Turnover", filterKey: "turnover", filterCount: 0 },
  { name: "Region", filterKey: "region", filterCount: 0 },
  { name: "CRM", filterKey: "crm", filterCount: 0 },
  { name: "Organization Type", filterKey: "orgType", filterCount: 0 },
  { name: "Import Countries", filterKey: "exportCountries", filterCount: 0 },
  { name: "Clients", filterKey: "clientsType", filterCount: 0 },
  { name: "More Filters", filterKey: "morefilter", filterCount: 0 }
]

const contactsFilter = [
  { name: "Contact no.", is_checked: true, alt: "contact_count" },
  { name: "Email ID", is_checked: true, alt: "email_count" },
  { name: "Both", is_checked: true, alt: "both_count" },
  { name: "None of both", is_checked: true, alt: "both_not" }
]

const CRMFilters = [
  { name: "Not assigned", is_checked: true },
  { name: "Onboarded", is_checked: true, status: 4 },
  {
    name: "Assigned", is_checked: true, subFilters: [
      { name: "Leads", is_checked: true, status: 1 },
      { name: "Task", is_checked: true, status: 0 },
      { name: "Not Intrested", is_checked: true, status: 2 },
      { name: "Lost", is_checked: true, status: 3 },
      { name: "Pending", is_checked: true, status: 'Pending' }
    ]
  }
]

const OrgType = [
  { name: "PVT LTD", is_checked: true },
  { name: "PUB LTD", is_checked: true },
  { name: "LLP", is_checked: true },
  { name: "Others", is_checked: true },

]

const resultType = [
  { name: "Exporter", is_checked: true },
]

const CRMAssignScreen = ({ navToggleState, userTokenDetails }) => {
  let todayDateObj = moment()
  let lastMonthDateObj = moment().subtract("1", "year")
  console.log('searchParam', localStorage.getItem('searchParam'));
  const showDetails = JSON.parse(localStorage.getItem("showDetails"))
  const isThroughExcel = localStorage.getItem('isThroughExcel')
  const userType = localStorage.getItem('userType')
  const countFrom = localStorage.getItem('countFrom')
  const countTo = localStorage.getItem('countTo')
  console.log('showDetails', showDetails, isThroughExcel, userType === 'Buyers' ? allfiltersBuyers : allfilters);



  const [showLoader, setShowLoader] = useState(false)
  const filter = JSON.parse(localStorage.getItem('searchParam') || {})
  const [filterMaster, setMasterFilter] = useState({ search: '', resultPerPage: 10 })
  const [refreshMaster, setMasterRefresh] = useState(1)
  const [filterData, setFilterData] = useState({})
  const [filterSearched, setFilteredSearch] = useState({})
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [dbData, setDbData] = useState([])
  const [salesPerson, setSalesPerson] = useState([])
  const [contactsPopup, togglecontactsPopup] = useState({ data: [], show: false, EXPORTER_CODE: '' })
  const HS_CODES = JSON.parse(localStorage.getItem('HS_CODES'))
  const userPermissionsForSubAdmin = JSON.parse(userTokenDetails.UserAccessPermission || "{}")
  const userId = userTokenDetails?.user_id
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0)
  const [tab, setTab] = useState('Count')
  const [tabExpHistory, setTabExpHistory] = useState('Values')
  const [turnoverPopup, setTurnoverPopup] = useState({
    show: false,
    data: null
  })
  const [refresh, setRefresh] = useState(1)
  const [selectedTask, setSelectedTask] = useState('Call List')
  const [assignmentType, setAssignmentType] = useState('Single')
  const [overalldata, setOveralldata] = useState([])
  let [data, setData] = useState({})
  const [errors, setErrors] = useState({});
  const [addMore, setAddMore] = useState([
    { name: 'assignee1', key1: 'subadminContact1', key2: 'Start1', key3: 'End1' }
  ])
  const [graphConfiguration, setGraphConfiguration] = useState({
    priceHistoryFrom: lastMonthDateObj.clone().format("YYYY-MM-DD"),
    priceHistoryTo: todayDateObj.clone().format("YYYY-MM-DD"),
    ExportHistoryFrom: lastMonthDateObj.clone().format("YYYY-MM-DD"),
    ExportHistoryTo: todayDateObj.clone().format("YYYY-MM-DD"),
    ExportHistoryGraphMode: true,
    priceHistoryGraphMode: true
  })
  const [graphTableMode, setGraphTableMode] = useState({
    ExportHistoryGraphMode: true,
    priceHistoryGraphMode: true
  })
  const [graphColumns, setGraphColumns] = useState({
    ExportHistoryGraphColumns: [],
    priceHistoryGraphColumns: []
  })
  const [exportHistoryTableData, setexportHistoryTableData] = useState([])
  const [priceHistoryTableData, setPriceHistoryTableData] = useState([])
  const [allFilters, setAllFilters] = useState({})
  const [turnOverMasterFilter, setturnOverMasterFilter] = useState(turnoverRange)
  const [contactsMasterFilter, setContactsMasterFilter] = useState(contactsFilter)
  const [CRMMasterFilter, setCRMMasterFilter] = useState(CRMFilters)
  const [CRMOrgTypeFilter, setCRMOrgTypeFilter] = useState(OrgType)
  const [CRMResultTypeFilter, setCRMResultTypeFilter] = useState(resultType)
  const [overallFilters, setOverallFilters] = useState(userType === 'Buyers' ? allfiltersBuyers : allfilters)
  const [CRMCityFilters, setCRMCityFilters] = useState([])
  const [CRMCountriesFilters, setCRMCountriesFilters] = useState([])
  const [CRMBuyersFilters, setCRMBuyersFilters] = useState([])

  const [countryData, setCountrydata] = useState([])
  const [countryoverall, setcountryoverall] = useState([])
  const [addmoreContacts, setAddMoreContacts] = useState(false)
  const [isEditContact, setIsEditContact] = useState({
    isEdit: false,
    _id: ""
  })
  const [tableLoader, setTableLoader] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState([])
  const [assignTaskLevel, setassignTaskLevel] = useState(0)
  const [overallIndex, setoverallIndex] = useState([])
  const [showdropdown, setshowdropdown] = useState(false)
  const [selectedGraphIndex, setSelectedGraphIndex] = useState(0)
  const [graphdata, setgraphdata] = useState([])
  const [chartconfig, setChartConfig] = useState([])
  const [exportHistory, setexportHistory] = useState([])
  const [exportchartconfig, setexportchartconfig] = useState([])
  const [quantitychartconfig, setquantitychartconfig] = useState([])

  const [exportTrendSelect, setexportTrendSelect] = useState('all')
  const [exportTrendgraphdata, setexportTrendgraphdata] = useState([])

  const [exportHistorySelect, setexportHistorySelect] = useState('all')
  const [exportHistorygraphdata, setexportHistorygraphdata] = useState([])
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [assignType, setAssignType] = useState('Random')
  const [graphDates, setGraphDates] = useState()
  const boxRef = useRef(null);
  const boxRef2 = useRef(null);
  const onlyShowForUserId = userPermissionsForSubAdmin?.mainAdmin ? undefined : userId
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  console.log('isOpennn', isOpen);
  const filteredArray = [];
  function processFilters(array) {
    for (const obj of array) {
      if (obj.is_checked) {
        if (obj.subFilters && obj.subFilters.length > 0) {
          processFilters(obj.subFilters);
        } else {
          filteredArray.push(obj);
        }
      }
    }
    return filteredArray
  }

  const handleClickOutside = useCallback(
    (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    },
    [boxRef]
  );

  const handleClickOutsideBoxRef2 = useCallback(
    (event) => {
      if (boxRef2.current && !boxRef2.current.contains(event.target)) {
        setIsOpen2(false);
      }
    },
    [boxRef2]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutsideBoxRef2);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutsideBoxRef2);
    };
  }, [handleClickOutside]);
  useEffect(() => {
    let overalldata = []
    if (exportHistorySelect === 'all') {
      overalldata = exportHistory || []
    } else {
      let keysincluded = ["label"]
      keysincluded.push(exportHistorySelect)
      overalldata = exportHistory?.map(obj => {
        const newObj = {};
        keysincluded.forEach(key => {
          newObj[key] = obj[key];
        });
        return newObj;
      }) || []
    }
    console.log('userOnboardSelect', overalldata);
    setexportHistorygraphdata(overalldata)
  }, [exportHistorySelect, exportHistory])

  useEffect(() => {
    let overalldata = []
    if (exportTrendSelect === 'all') {
      overalldata = graphdata || []
    } else {
      let keysincluded = ["label"]
      keysincluded.push(exportTrendSelect)
      overalldata = graphdata?.map(obj => {
        const newObj = {};
        keysincluded.forEach(key => {
          newObj[key] = obj[key];
        });
        return newObj;
      }) || []
    }
    console.log('userOnboardSelect', overalldata);
    setexportTrendgraphdata(overalldata)
  }, [exportTrendSelect, graphdata])

  useEffect(() => {
    let columndata = [{ name: "Date" }]
    let tabledata = []
    if (tabExpHistory === 'Values') {
      for (let i = 0; i <= exportchartconfig.length - 1; i++) {
        let element = exportchartconfig[i]
        columndata.push({
          name: element.dataKey?.split("_")[0]
        })
        if (exportHistory && exportHistory.length) {
          const item = exportHistory[i]
          tabledata.push([item.label])

        }
      }
      setGraphColumns({
        ...graphColumns,
        ExportHistoryGraphColumns: columndata
      })
      let resarray = []
      let totalObj = ["Total"]
      for (let index = 0; index < exportHistory.length; index++) {
        const element = exportHistory[index];
        let tempArray = []
        tempArray.push(getXAxisDateFormat(graphConfiguration.ExportHistoryTo, graphConfiguration.ExportHistoryFrom, element.label))
        for (let j = 1; j < columndata.length; j++) {
          const item = columndata[j]
          tempArray.push(`$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(element[`${item.name}_VALUE`])}`)
          totalObj[j] = totalObj[j] ? totalObj[j] + element[`${item.name}_VALUE`] : element[`${item.name}_VALUE`]
        }
        resarray.push(tempArray)
      }
      resarray.push(totalObj.map((item, index) => index === 0 ? item : `$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(item)}`))
      setexportHistoryTableData(resarray)
    } else {
      for (let i = 0; i <= quantitychartconfig.length - 1; i++) {
        let element = quantitychartconfig[i]
        columndata.push({
          name: element.dataKey?.split("_")[0]
        })
      }
      setGraphColumns({
        ...graphColumns,
        ExportHistoryGraphColumns: columndata
      })
      let resarray = []
      let totalObj = ["Total"]
      for (let index = 0; index < exportHistory.length; index++) {
        const element = exportHistory[index];
        let tempArray = []
        tempArray.push(getXAxisDateFormat(graphConfiguration.ExportHistoryTo, graphConfiguration.ExportHistoryFrom, element.label))
        for (let j = 1; j < columndata.length; j++) {
          const item = columndata[j]
          tempArray.push(element[`${item.name}_QUANTITY`])
          totalObj[j] = totalObj[j] ? totalObj[j] + element[`${item.name}_QUANTITY`] : element[`${item.name}_QUANTITY`]
        }
        resarray.push(tempArray)
      }
      resarray.push(totalObj.map((item, index) => index === 0 ? item : item?.toFixed(2)))
      setexportHistoryTableData(resarray)
    }
  }, [graphTableMode.ExportHistoryGraphMode, , tabExpHistory])
  useEffect(() => {
    let columndata = [{ name: "Date" }]
    let tabledata = []
    for (let i = 0; i <= chartconfig.length - 1; i++) {
      let element = chartconfig[i]
      columndata.push({
        name: element.dataKey
      })
      if (graphdata && graphdata.length) {
        const item = graphdata[i]
        tabledata.push([item.label])

      }
    }
    setGraphColumns({
      ...graphColumns,
      priceHistoryGraphColumns: columndata
    })
    let resarray = []
    let totalObj = ["Total"]
    for (let index = 0; index < graphdata.length; index++) {
      const element = graphdata[index];
      let tempArray = []
      tempArray.push(getXAxisDateFormat(graphConfiguration.priceHistoryTo, graphConfiguration.priceHistoryFrom, element.label))
      for (let j = 1; j < columndata.length; j++) {
        const item = columndata[j]
        tempArray.push("$ " + element[`${item.name}`])
        totalObj[j] = totalObj[j] ? parseFloat(totalObj[j] + element[`${item.name}`]) : parseFloat(element[`${item.name}`])
      }
      resarray.push(tempArray)
    }
    resarray.push(totalObj.map((item, index) => index === 0 ? item : "$ " + (item / graphdata.length)?.toFixed(2)))
    setPriceHistoryTableData(resarray)

  }, [graphTableMode.priceHistoryGraphMode])

  const getCountriesCount = (country_name) => {
    let objectAPI = {
      currentPage: page,
      resultPerPage: filter.resultPerPage,
      ...filter,
      country_name,
      searchParam: filter.search,
      HS_CODES: HS_CODES.filter(item => item.is_checked).map(item => item.HS_CODE),
      AVAILABLE_CONTACTS: contactsMasterFilter.every(item => item.is_checked) ? [] : contactsMasterFilter.filter(item => item.is_checked),
      TURNOVER_RANGE: turnOverMasterFilter.every(item => item.is_checked) ? [] : turnOverMasterFilter.filter(item => item.is_checked),
      CITIES: CRMCityFilters.every(item => item.is_checked) ? [] : CRMCityFilters.filter(item => item.is_checked).map(item => item.name),
      STATUS: processFilters(CRMMasterFilter),
      ORGANIZATION_TYPE: CRMOrgTypeFilter.every(item => item.is_checked) ? [] : CRMOrgTypeFilter.filter(item => item.is_checked).map(item => item.name),
      COUNTRIES: CRMCountriesFilters.every(item => item.is_checked) ? [] : CRMCountriesFilters.filter(item => item.is_checked).map(item => item.name),
      BUYERS: CRMBuyersFilters.every(item => item.is_checked) ? [] : CRMBuyersFilters.filter(item => item.is_checked).map(item => item.value),
      showImports: userType === 'Buyers'
    }
    if (!country_name) {
      objectAPI["country_name"] = showDetails.data?.country
    }
    if (isNaN(filter.search) || isThroughExcel) {
      objectAPI["EXPORTER_NAMES"] = showDetails.data?.EXPORTER_NAMES
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
        }
      }
    }
    objectAPI["groupParam"] = graphdropdown[selectedGraphIndex].key
    //setShowLoader(true)
    call('POST', 'getCountriesCountV3', objectAPI).then(result => {
      setShowLoader(false)
      setCountrydata(result)
    }).catch(e => {
      setShowLoader(false)

    })
  }
  useEffect(() => {
    getCountriesCount()
  }, [selectedGraphIndex])
  const getHSTrendGraph = () => {
    //setShowLoader(true)
    let reqObj = {
      priceHistoryFrom: graphConfiguration.priceHistoryFrom,
      priceHistoryTo: graphConfiguration.priceHistoryTo,
      searchParam: filter.search,
      HS_CODES: HS_CODES.filter(item => item.is_checked).map(item => item.HS_CODE),
      EXPORTER_NAMES: showDetails.data?.EXPORTER_NAMES,
      country_name: showDetails.data?.country,
      showImports: userType === 'Buyers'
    }
    call('POST', 'getHSTrendGraphV2', reqObj).then(result => {
      setgraphdata(result.message)
      setChartConfig(result.chartconfig)
      setShowLoader(false)
    }).catch(e => {
      console.log('error in HS', e);
      setShowLoader(false)

    })
  }
  const getHSExportTrendGraph = () => {
    let reqObj = {
      priceHistoryFrom: graphConfiguration.ExportHistoryFrom,
      priceHistoryTo: graphConfiguration.ExportHistoryTo,
      searchParam: filter.search,
      HS_CODES: HS_CODES.filter(item => item.is_checked).map(item => item.HS_CODE),
      EXPORTER_NAMES: showDetails.data?.EXPORTER_NAMES,
      country_name: showDetails.data?.country,
      showImports: userType === 'Buyers'
    }
    call('POST', 'getHSExportTrendGraphV2', reqObj).then(result => {
      setexportHistory(result.message)
      setexportchartconfig(result.chartconfig)
      setquantitychartconfig(result.quantitychartconfig)
    }).catch(e => {
      console.log('error in HS', e);
    })
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

    let searchParam = filter.search
    let HS_CODE = HS_CODES.filter(item => item.is_checked).map(item => item.HS_CODE)
    let AVAILABLE_CONTACTS = contactsMasterFilter.every(item => item.is_checked) ? [] : contactsMasterFilter.filter(item => item.is_checked)
    let TURNOVER_RANGE = turnOverMasterFilter.every(item => item.is_checked) ? [] : turnOverMasterFilter.filter(item => item.is_checked)
    let CITIES = CRMCityFilters.every(item => item.is_checked) ? [] : CRMCityFilters.filter(item => item.is_checked).map(item => item.name)
    let STATUS = processFilters(CRMMasterFilter)
    let ORGANIZATION_TYPE = CRMOrgTypeFilter.every(item => item.is_checked) ? [] : CRMOrgTypeFilter.filter(item => item.is_checked).map(item => item.name)
    let COUNTRIES = CRMCountriesFilters.every(item => item.is_checked) ? [] : CRMCountriesFilters.filter(item => item.is_checked).map(item => item.name)
    let BUYERS = CRMBuyersFilters.every(item => item.is_checked) ? [] : CRMBuyersFilters.filter(item => item.is_checked).map(item => item.value)


    let filters = []
    if (HS_CODE.length > 0) {
      filters.push({
        name: 'HS Code',
        value: HS_CODE
      })
    }
    if (AVAILABLE_CONTACTS.length > 0) {
      filters.push({
        name: 'Available Contacts',
        value: AVAILABLE_CONTACTS``
      })
    }
    if (TURNOVER_RANGE.length > 0) {
      filters.push({
        name: 'Turnover',
        value: TURNOVER_RANGE
      })
    }
    if (CITIES.length > 0) {
      filters.push({
        name: 'City',
        value: CITIES
      })
    }
    if (STATUS.length > 0) {
      filters.push({
        name: 'CRM',
        value: STATUS
      })
    }
    if (ORGANIZATION_TYPE.length > 0) {
      filters.push({
        name: 'Organization Type',
        value: ORGANIZATION_TYPE
      })
    }
    if (COUNTRIES.length > 0) {
      filters.push({
        name: 'Buyer Country',
        value: COUNTRIES
      })
    }
    if (BUYERS.length > 0) {
      filters.push({
        name: userType === 'Buyers' ? 'Suppliers' : 'Buyers',
        value: BUYERS
      })
    }
    if (searchParam) {
      filters.push({
        name: 'Search',
        value: searchParam
      })
    }
    filters.push({
      name: 'User Type',
      value: userType
    })
    let country = showDetails.data?.country
    if (country) {
      filters.push({
        name: 'Exporter Country',
        value: country
      })
    }



    let reqObj = {
      AssignmentObject: obj,
      FOLDER_NAME: data.foldername,
      ASSIGNEE_ID: userTokenDetails?.user_id,
      ASSIGNEE_NAME: userTokenDetails?.userName,
      FILTERS: filters
    }
    setShowLoader(true)
    console.log('API REQ', reqObj);
    call('POST', 'AssignMasterBulkDataTask', reqObj).then(result => {
      toastDisplay(result, "success")
      setShowLoader(false)
      getCRMMasterdata()
      // getCRMMasterdataFilters()
      // getCRMMasterTblFilters()
      getCountriesCount()
      setshowdropdown(false)
    }).catch(e => {
      setShowLoader(false)
      toastDisplay(e, "error")

    })
  }
  const addExtraContactDetails = () => {
    let errors = {}
    if (!data.department && !data.contact_person && !data.designation && !data.contactNo && !data.email_id) {
      errors.department = 'Department cannot be empty'
      errors.contact_person = 'Contact Person cannot be empty'
      errors.designation = 'Designation Cannot be empty'
      errors.contactNo = 'Contact Number cannot be empty'
      errors.email_id = 'Email ID Cannot be empty'
    }
    if (!isEmpty(errors)) {
      setErrors(errors)
    } else {
      setShowLoader(true)
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
        setShowLoader(false)
        setAddMoreContacts(false)
        togglecontactsPopup({ data: [], show: false, EXPORTER_CODE: '' })
        getCRMMasterdata()
      }).catch(e => {
        toastDisplay(e, "error")
        setShowLoader(false)
      })
    }
  }
  useEffect(() => {
    let columndata = [{ name: "Date" }]
    let tabledata = []
    if (tabExpHistory === 'Values') {
      for (let i = 0; i <= exportchartconfig.length - 1; i++) {
        let element = exportchartconfig[i]
        columndata.push({
          name: element.dataKey?.split("_")[0]
        })
        if (exportHistory && exportHistory.length) {
          const item = exportHistory[i]
          tabledata.push([item.label])

        }
      }
      setGraphColumns({
        ...graphColumns,
        ExportHistoryGraphColumns: columndata
      })
      let resarray = []
      let totalObj = ["Total"]
      for (let index = 0; index < exportHistory.length; index++) {
        const element = exportHistory[index];
        let tempArray = []
        tempArray.push(getXAxisDateFormat(graphConfiguration.ExportHistoryTo, graphConfiguration.ExportHistoryFrom, element.label))
        for (let j = 1; j < columndata.length; j++) {
          const item = columndata[j]
          tempArray.push(`$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(element[`${item.name}_VALUE`])}`)
          totalObj[j] = totalObj[j] ? totalObj[j] + element[`${item.name}_VALUE`] : element[`${item.name}_VALUE`]
        }
        resarray.push(tempArray)
      }
      resarray.push(totalObj.map((item, index) => index === 0 ? item : `$ ${Intl.NumberFormat("en", { notation: 'compact' }).format(item)}`))
      setexportHistoryTableData(resarray)
    } else {
      for (let i = 0; i <= quantitychartconfig.length - 1; i++) {
        let element = quantitychartconfig[i]
        columndata.push({
          name: element.dataKey?.split("_")[0]
        })
      }
      setGraphColumns({
        ...graphColumns,
        ExportHistoryGraphColumns: columndata
      })
      let resarray = []
      let totalObj = ["Total"]
      for (let index = 0; index < exportHistory.length; index++) {
        const element = exportHistory[index];
        let tempArray = []
        tempArray.push(getXAxisDateFormat(graphConfiguration.ExportHistoryTo, graphConfiguration.ExportHistoryFrom, element.label))
        for (let j = 1; j < columndata.length; j++) {
          const item = columndata[j]
          tempArray.push(element[`${item.name}_QUANTITY`])
          totalObj[j] = totalObj[j] ? totalObj[j] + element[`${item.name}_QUANTITY`] : element[`${item.name}_QUANTITY`]
        }
        resarray.push(tempArray)
      }
      resarray.push(totalObj.map((item, index) => index === 0 ? item : item?.toFixed(2)))
      setexportHistoryTableData(resarray)
    }
  }, [graphTableMode.ExportHistoryGraphMode, , tabExpHistory])
  useEffect(() => {
    let columndata = [{ name: "Date" }]
    let tabledata = []
    for (let i = 0; i <= chartconfig.length - 1; i++) {
      let element = chartconfig[i]
      columndata.push({
        name: element.dataKey
      })
      if (graphdata && graphdata.length) {
        const item = graphdata[i]
        tabledata.push([item.label])

      }
    }
    setGraphColumns({
      ...graphColumns,
      priceHistoryGraphColumns: columndata
    })
    let resarray = []
    let totalObj = ["Total"]
    for (let index = 0; index < graphdata.length; index++) {
      const element = graphdata[index];
      let tempArray = []
      tempArray.push(getXAxisDateFormat(graphConfiguration.priceHistoryTo, graphConfiguration.priceHistoryFrom, element.label))
      for (let j = 1; j < columndata.length; j++) {
        const item = columndata[j]
        tempArray.push("$ " + element[`${item.name}`])
        totalObj[j] = totalObj[j] ? parseFloat(totalObj[j] + element[`${item.name}`]) : parseFloat(element[`${item.name}`])
      }
      resarray.push(tempArray)
    }
    resarray.push(totalObj.map((item, index) => index === 0 ? item : "$ " + (item / graphdata.length)?.toFixed(2)))
    setPriceHistoryTableData(resarray)

  }, [graphTableMode.priceHistoryGraphMode])
  const handleGraphConfigurationChange = async (event) => {
    if (event.persist) {
      event.persist()
    }
    setGraphConfiguration({ ...graphConfiguration, [event.target.name]: event.target.value })
  }
  const getXAxisDateFormat = (toDate, FromDate, value) => {
    let countForMonths = moment(toDate).diff(FromDate, 'month')
    let dateFormat = ''
    if (countForMonths > 12) {
      dateFormat = value
    }
    if (countForMonths > 3) {
      dateFormat = moment(value).format('MMM YYYY')
    } else if (countForMonths === 1) {
      dateFormat = moment(value).format('DD MMM YYYY')
    } else {
      dateFormat = value
    }
    return dateFormat
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
    if (assignType != 'Random') {
      fillIndexes()
    }
  }, [overallIndex, assignType])
  useEffect(() => {
    if (assignTaskLevel === 1) {
      updateTableRowsTicks()
    }
  }, [selectedIndex])
  useEffect(() => {
    setOverallFilters(userType === 'Buyers' ? [
      { name: "Buyers", filterKey: "IMPEXP", filterCount: 1 },
      { name: "Available Contacts", filterKey: "AvailContacts", filterCount: contactsMasterFilter.filter(item => item.is_checked).length },
      { name: "Turnover", filterKey: "turnover", filterCount: turnOverMasterFilter.filter(item => item.is_checked).length },
      { name: "Region", filterKey: "region", filterCount: CRMCityFilters.filter(item => item.is_checked).length },
      { name: "CRM", filterKey: "crm", filterCount: CRMMasterFilter.filter(item => item.is_checked).length },
      { name: "Organization Type", filterKey: "orgType", filterCount: CRMOrgTypeFilter.filter(item => item.is_checked).length },
      { name: "Import Countries", filterKey: "exportCountries", filterCount: CRMCountriesFilters.filter(item => item.is_checked).length },
      { name: "Clients", filterKey: "clientsType", filterCount: CRMBuyersFilters.filter(item => item.is_checked).length },
      { name: "More Filters", filterKey: "morefilter", filterCount: 0 }
    ] : [
      { name: "Exporters", filterKey: "IMPEXP", filterCount: 1 },
      { name: "Available Contacts", filterKey: "AvailContacts", filterCount: contactsMasterFilter.filter(item => item.is_checked).length },
      { name: "Turnover", filterKey: "turnover", filterCount: turnOverMasterFilter.filter(item => item.is_checked).length },
      { name: "Region", filterKey: "region", filterCount: CRMCityFilters.filter(item => item.is_checked).length },
      { name: "CRM", filterKey: "crm", filterCount: CRMMasterFilter.filter(item => item.is_checked).length },
      { name: "Organization Type", filterKey: "orgType", filterCount: CRMOrgTypeFilter.filter(item => item.is_checked).length },
      { name: "Export Countries", filterKey: "exportCountries", filterCount: CRMCountriesFilters.filter(item => item.is_checked).length },
      { name: "Clients", filterKey: "clientsType", filterCount: CRMBuyersFilters.filter(item => item.is_checked).length },
      { name: "More Filters", filterKey: "morefilter", filterCount: 0 }
    ])
  }, [turnOverMasterFilter, contactsMasterFilter, CRMMasterFilter, CRMOrgTypeFilter, CRMCityFilters, CRMCountriesFilters, CRMBuyersFilters])

  const getCRMMasterTblFilters = (country_name) => {
    let objectAPI = {
      ...filter,
      country_name,
      searchParam: filter.search,
      HS_CODES: HS_CODES.filter(item => item.is_checked).map(item => item.HS_CODE),
      showImports: userType === 'Buyers'

    }
    if (!country_name) {
      objectAPI["country_name"] = showDetails.data?.country
    }
    objectAPI["EXPORTER_NAMES"] = showDetails.data?.EXPORTER_NAMES
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
    call('POST', 'getCRMMasterTblFiltersV2', objectAPI).then(result => {
      setFilterData(result)
      setFilteredSearch(result)
    }).catch(e => {

    })
  }
  useEffect(() => {
    if (showDetails.show) {
      getHSTrendGraph()
      getHSExportTrendGraph()
    }

  }, [graphConfiguration])
  const updateLeadAssignedTo = (LeadAssignedObj, EXPORTER_CODE) => {
    setShowLoader(true)
    call('POST', 'AssignMasterDataTask', { LeadAssignedObj, EXPORTER_CODE }).then(result => {
      toastDisplay("Lead updated", "success")
      getCRMMasterdata()
      getCRMMasterdataFilters()
      getCRMMasterTblFilters()
    }).catch(e => {
      setShowLoader(false)
      toastDisplay("Failed to assign lead to " + LeadAssignedObj.contact_person, "error")
    })
  }
  useEffect(() => {
    getCRMMasterdata()
    getCountriesCount()
    getCRMMasterTblFilters()
  }, [refresh])
  useEffect(() => {
    getCRMMasterdata()
  }, [page, refreshMaster, filterData])
  async function handlecontactsPopup(itemData) {
    togglecontactsPopup({ show: true, data: itemData?.EXTRA_DETAILS || [], EXPORTER_CODE: itemData.EXPORTER_CODE })
  }
  useEffect(() => {
    if (userPermissionsForSubAdmin.mainAdmin || userPermissionsForSubAdmin?.["Assign Task"]) {
      setShowLoader(true)
      call("POST", 'getSubAdminUser', {}).then(res => {
        setShowLoader(false)
        setSalesPerson(res.data)
      }).catch(err => setShowLoader(false))
    } else {
      setShowLoader(true)
      call("POST", 'getSubAdminUser', { parentId: onlyShowForUserId }).then(res => {
        setShowLoader(false)
        setSalesPerson(res.data)
      }).catch(err => setShowLoader(false))
    }
    axios.get(platformBackendUrl + "/getallCountry").then((result) => {
      if (result.data.message && result.data.message.length) {
        setcountryoverall(result.data.message);
      }
    });
    console.log('CallingFromInitial');
    getHSTrendGraph()
    getHSExportTrendGraph()
    getCountriesCount()
    getCRMMasterdataFilters()
    getCRMMasterTblFilters()
  }, [])

  const handleChange = (event) => {
    const temp = [...addMore]

    if (event.target.name?.includes("subadminContact")) {
      const index = addMore.findIndex(item => item.key1 === event.target.name)
      temp[index] = {
        ...temp[index],
        [`subadminContactVal${index + 1}`]: event.target.value
      }
    }
    else if (event.target.name === 'event_date') {
      setData({ ...data, [event.target.name]: event.target.value })
      setErrors({ ...errors, [event.target.name]: "" })
    } else {
      setData({ ...data, [event.target.name]: event.target.value })
      setErrors({ ...errors, [event.target.name]: "" })
    }
    event.persist();
    setAddMore(temp)
  }

  function formatDataForTable(data) {
    let tableData = []
    let row = []
    data.forEach((item, index) => {
      try {
        let mappedData = getContactObject(item.EXTRA_DETAILS ? item.EXTRA_DETAILS : [])
        row[0] = <span className={`${item.STATUS === 4 ? 'color-2ECC71' : ''}`}>{item.EXPORTER_NAME}</span>
        row[1] = mappedData && mappedData['Contact Person'] ? mappedData['Contact Person'] : 'NA'
        row[2] = <div onClick={() => handlecontactsPopup(item)} className='cursor'>
          {mappedData && mappedData['Contact Number'] ? mappedData['Contact Number'] : 'NA'}
        </div>
        row[3] = mappedData ? mappedData['Designation'] ? mappedData['Designation'] : 'NA' : 'NA'
        row[4] = item.TOTAL_BUYERS
        row[5] = item.EXPORTER_CITY
        row[6] = ('FOB_BY_HS' in item) ? "$ " + Intl.NumberFormat("en", { notation: 'compact' }).format(item.FOB_BY_HS) : item.FOB ? "$ " + Intl.NumberFormat("en", { notation: 'compact' }).format(item.FOB) : ''
        row[7] = <div class="dropdown w-100" >
          <label class="font-wt-600 font-size-13 cursor" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
            {item?.TASK_ASSIGNED_TO?.[0]?.contact_person || '-'}
          </label>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
            {salesPerson.map(element => {
              return <li className="dropdown-item cursor" onClick={() => updateLeadAssignedTo({
                id: element.id,
                contact_person: element.contact_person,
                name_title: element.name_title,
                designation: element.designation,
                email_id: element.email_id
              }, item.EXPORTER_CODE)} >{element.contact_person}</li>
            })}
          </ul>
        </div>

        row[8] = <img src='/assets/images/redirect.svg' className='cursor' onClick={async () => {
          if (userType === 'Exporters') {
            if (item.STATUS === 4) {
              setShowLoader(true)
              call('POST', 'getExporterByTTVCode', { ttvExporterCode: item.EXPORTER_CODE }).then(result => {
                setShowLoader(false)
                //window.location = '/masterdataProfile'
                localStorage.setItem('exporterDetails', JSON.stringify({
                  isVisible: true,
                  data: result,
                  isOnboarded: true
                }))
                window.open('/masterdataProfile', '_blank')
              }).catch(e => {
                setShowLoader(false)
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
          } else {
            localStorage.setItem("ttvBuyerInfo", JSON.stringify({ _id: item.EXPORTER_NAME, purchased: true }))
            window.open(platformURL + `/userDetail?type=buyer`, '_blank');
          }
        }} />
        tableData.push(row)
        row = []
      } catch (e) {
        console.log('error in formatdatafortable', e);
      }
    })
    return tableData
  }
  const getCRMMasterdataFilters = (country_name) => {
    let objectAPI = {
      ...filter,
      country_name,
      searchParam: filter.search,
      HS_CODES: HS_CODES.filter(item => item.is_checked).map(item => item.HS_CODE),
      showImports: userType === 'Buyers'
    }
    if (!country_name) {
      objectAPI["country_name"] = showDetails.data?.country
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
    if (isNaN(filter.search) || isThroughExcel) {
      objectAPI["EXPORTER_NAMES"] = showDetails.data?.EXPORTER_NAMES
    }
    setShowLoader(true)
    call('POST', 'getCRMMasterdataFiltersV2', objectAPI).then(result => {
      setShowLoader(false)
      setAllFilters(result)
      if (result?.EXPORTER_CITY) {
        let sortedata = result?.EXPORTER_CITY?.sort()
        let finalData = []
        for (let i = 0; i <= sortedata?.length - 1; i++) {
          const item = sortedata[i]
          finalData.push({
            name: item,
            is_checked: true
          })
        }
        setCRMCityFilters(finalData)
      }
      if (result.EXPORT_COUNTRIES) {
        let exportCountrydata = []
        for (let i = 0; i <= result?.EXPORT_COUNTRIES.length - 1; i++) {
          const item = result?.EXPORT_COUNTRIES[i]
          exportCountrydata.push({
            name: item,
            is_checked: true
          })
        }
        setCRMCountriesFilters(exportCountrydata)
      }
      if (result.BUYER_NAMES) {
        let buyernames = []
        for (let i = 0; i <= result?.BUYER_NAMES.length - 1; i++) {
          const item = result?.BUYER_NAMES[i]
          buyernames.push({
            name: item,
            value: item,
            is_checked: true
          })
        }
        setCRMBuyersFilters(buyernames)
      }
    }).catch(e => {
      setShowLoader(false)

    })

  }
  const getCRMMasterdata = (country_name) => {
    let objectAPI = {
      currentPage: page,
      resultPerPage: filterMaster.resultPerPage,
      ...filterMaster,
      country_name,
      searchParam: filter.search,
      HS_CODES: HS_CODES.filter(item => item.is_checked).map(item => item.HS_CODE),
      AVAILABLE_CONTACTS: contactsMasterFilter.every(item => item.is_checked) ? [] : contactsMasterFilter.filter(item => item.is_checked),
      TURNOVER_RANGE: turnOverMasterFilter.every(item => item.is_checked) ? [] : turnOverMasterFilter.filter(item => item.is_checked),
      CITIES: CRMCityFilters.every(item => item.is_checked) ? [] : CRMCityFilters.filter(item => item.is_checked).map(item => item.name),
      STATUS: processFilters(CRMMasterFilter),
      ORGANIZATION_TYPE: CRMOrgTypeFilter.every(item => item.is_checked) ? [] : CRMOrgTypeFilter.filter(item => item.is_checked).map(item => item.name),
      COUNTRIES: CRMCountriesFilters.every(item => item.is_checked) ? [] : CRMCountriesFilters.filter(item => item.is_checked).map(item => item.name),
      BUYERS: CRMBuyersFilters.every(item => item.is_checked) ? [] : CRMBuyersFilters.filter(item => item.is_checked).map(item => item.value),
      showImports: userType === 'Buyers'

    }
    if (!country_name) {
      objectAPI["country_name"] = showDetails.data?.country
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
        }
      }
    }
    if (isNaN(filter.search) || isThroughExcel) {
      objectAPI["EXPORTER_NAMES"] = showDetails.data?.EXPORTER_NAMES
    }
    setTableLoader(true)
    call('POST', 'getCRMMasterdataV2', objectAPI).then(result => {
      setDbData(formatDataForTable(result.message))
      setCount(result.total_records)
      setOveralldata(result.message)
      setassignTaskLevel(0)

      setSelectedIndex([])
      setshowdropdown(false)
      setTableLoader(false)
    }).catch(e => {
      setShowLoader(false)
      setTableLoader(false)
    })

  }

  const downLoadMasterdata = () => {
    let finaldata = []
    for (let i = 0; i <= overalldata.length - 1; i++) {
      const firstExporter = overalldata[i]
      const groupedArray = firstExporter?.HS_CODES?.reduce((groups, obj) => {
        const { HS_CODES } = obj;
        const firstTwoDigits = HS_CODES.substring(0, 2);

        if (!groups[firstTwoDigits]) {
          groups[firstTwoDigits] = [];
        }

        groups[firstTwoDigits].push(obj);
        return groups;
      }, {});
      const keys = Object.keys(groupedArray || {});
      const hsRes = keys.map(key => ({ HS_CODE: key }));
      let exportObj = {
        SR_NO: i + 1,
        EXPORTER_CODE: firstExporter?.EXPORTER_CODE,
        EXPORTER_NAME: firstExporter?.EXPORTER_NAME || "",
        EXPORTER_ADDRESS: firstExporter?.EXPORTER_ADDRESS || "",
        TOTAL_BUYERS: firstExporter?.BUYERS?.length || 0,
        EXPORTER_CITY: firstExporter.EXPORTER_CITY,
        FOB: firstExporter?.FOB_BY_HS ? firstExporter?.FOB_BY_HS : firstExporter?.FOB,
        "HS Code": hsRes.map(item => item.HS_CODE).join(","),

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
            TOTAL_BUYERS: "",
            FOB: "",
            "HS Code": "",
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
    ExportExcel(finaldata, 'Master_data')
  }
  return (
    <div className={"container-fluid"}>
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      {tableLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}

      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      {turnoverPopup.show &&
        <FinanceInvoiceModal limitinvoice={turnoverPopup.show} headerTitle={'Add Turnover Filter'} modalSize={"sm"} isCentered={true} closeSuccess={() => {
          setTurnoverPopup({ show: false, data: null })
        }}>
          <>
            <div className='d-flex flex-row align-items-center gap-2 pl-4'>
              <label className='font-size-14 font-wt-400 mb-0'>From</label>
            </div>
            <div className="col-md-10 ml-4 mt-4">
              <div className="col-md-12 px-0">
                <NewInput isAstrix={true} type={"number"} label={""}
                  name={"turnOverFrom"} defaultValue={turnoverPopup?.data?.turnOverFrom || ""}
                  value={data.turnOverFrom} error={errors.turnOverFrom}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className='d-flex flex-row align-items-center gap-2 pl-4'>
              <label className='font-size-14 font-wt-400 mb-0'>To</label>
            </div>
            <div className="col-md-10 ml-4 mt-4">
              <div className="col-md-12 px-0">
                <NewInput isAstrix={true} type={"number"} label={""}
                  name={"turnOverTo"} defaultValue={turnoverPopup?.data?.turnOverTo || ""}
                  value={data.turnOverTo} error={errors.turnOverTo}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button type="button"
              onClick={() => {
                if ((data.turnOverFrom && data.turnOverTo)) {
                  const minRange = parseInt(data.turnOverFrom)
                  const maxRange = parseInt(data.turnOverTo)
                  if (maxRange > minRange) {
                    const temp = [...turnOverMasterFilter]
                    const insertObj = {
                      min: Intl.NumberFormat('en-US', { notation: 'compact' }).format(data.turnOverFrom),
                      max: Intl.NumberFormat('en-US', { notation: 'compact' }).format(data.turnOverTo),
                      is_checked: true,
                      minVal: minRange,
                      maxVal: maxRange
                    }
                    temp.push(insertObj)
                    console.log('Unsersssss', insertObj);
                    setturnOverMasterFilter(temp)
                    setTurnoverPopup({ show: false, data: null })
                  } else {
                    toastDisplay("To Value Should be greater than from", "info")
                  }

                } else {
                  toastDisplay("Range cannot be empty", "info")
                }

              }}
              className={`new-btn w-40 py-2 px-3 text-white`}>
              {"Save"}
            </button>
          </>
        </FinanceInvoiceModal>

      }
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
                  <NewInput isAstrix={false} type={"text"} label={"Folder Name"}
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
                      AssignTasksInBulkV2(data.leadAssignedTo, data.leadAssignedToSec)
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
                    setData({
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
                      selectData={countryoverall} selectName={"phoneCode"} selectValue={data.phoneCode} optionLabel={"phonecode"}
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
                    onClick={() => setData({ ...data, primaryDetails: !data.primaryDetails })}
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
                            <span className='font-size-14 text-color-label font-wt-500 mb-0'>{` (${item.Department}) `}</span>
                          </p>
                          <img src='assets/images/edit-icon.png' className='cursor ml-4' onClick={() => {
                            setData({
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
      <div className="row">

        <SideBarV2 state={"masterdata"} userTokenDetails={userTokenDetails} />
        <main role="main" className={`ml-sm-auto col-lg-10 ` + (navToggleState.status ? " expanded-right" : "")} id="app-main-div">
          <HeaderV2
            title={"Master Data"}
            userTokenDetails={userTokenDetails} />

          <>
            <img src='assets/images/ArrowBackLeft.png' onClick={() => {
              window.history.back()
            }} />
            <div className='row mt-2 ml-1'>
              <div className='card p-0 w-35 rounded d-flex flex-row'>
                <div className='col-md-6 px-0'>
                  {overallFilters.map((item, index) => {
                    return <div className='p-2 border-left-0 d-flex justify-content-between align-items-center detailssection cursor' onClick={() => setSelectedFilterIndex(index)}>
                      <label className='font-size-14 font-wt-600'>{item.name}</label>
                      <div className='circle bg-5CB8D3'>
                        <label className='color-white font-size-14 font-wt-600 m-0'>{item.filterCount}</label>
                      </div>
                    </div>
                  })}
                </div>
                <div className='col-md-6 px-0'>
                  <div className={`w-100 px-0 ${selectedFilterIndex === 4 ? ' ' : 'cityDiv'}  `}>
                    {selectedFilterIndex === 0 &&
                      <div className='card p-4 rounded h-100'>
                        <div className='text-center'>
                          <div className='d-flex flex-row gap-3'>
                            <img src={'/assets/images/checked-green.png'} height={20} width={20} className='mr-2 cursor' />
                            <label className='font-size-14 font-wt-600 text-decoration-underline'>{`Total ${userType}`}</label>
                          </div>
                          <label className='font-size-14 font-wt-600'>{allFilters?.EXPORTER_COUNT}</label>
                        </div>
                      </div>
                    }
                    {selectedFilterIndex === 1 &&
                      <div className='p-3'>
                        {contactsMasterFilter.map((item, index) => {
                          return <div className='d-flex flex-row gap-2 mt-2' key={index}>
                            <img src={item.is_checked ? '/assets/images/checked-green.png' : '/assets/images/unchecked-box.png'} height={20} width={20} className='mr-2 cursor' onClick={() => {
                              const updatedTO = [...contactsMasterFilter]; // create a new array
                              updatedTO[index] = {
                                ...updatedTO[index],
                                is_checked: !updatedTO[index].is_checked
                              };
                              setContactsMasterFilter(updatedTO);
                            }} />
                            <label className='font-size-14 font-wt-600'>{item.name}</label>
                            <label className='font-size-14 font-wt-700 mb-0'>{allFilters?.[item.alt]}</label>

                          </div>
                        })}
                      </div>
                    }
                    {selectedFilterIndex === 2 &&
                      <div className='p-3'>
                        {turnOverMasterFilter.map((item, index) => {
                          return <div className='d-flex flex-row gap-2 mt-2' key={index}>
                            <img src={item.is_checked ? '/assets/images/checked-green.png' : '/assets/images/unchecked-box.png'} height={20} width={20} className='mr-2 cursor' onClick={() => {
                              const updatedTO = [...turnOverMasterFilter]; // create a new array
                              updatedTO[index] = {
                                ...updatedTO[index],
                                is_checked: !updatedTO[index].is_checked
                              };
                              setturnOverMasterFilter(updatedTO);
                            }} />
                            <label className='font-size-14 font-wt-600'>{item.min + " - " + item.max}</label>
                          </div>
                        })}
                        <div>
                          <button className={`new-btn2 py-1 px-3 mt-1 text-color1 cursor`} onClick={() => setTurnoverPopup({ show: true, data: null })}>New</button>
                        </div>
                      </div>
                    }
                    {selectedFilterIndex === 3 &&
                      <div className='p-3 '>
                        <div className='d-flex flex-row gap-2 mt-2' >
                          <img src={CRMCityFilters.every(item => item.is_checked) ? '/assets/images/checked-green.png' : '/assets/images/unchecked-box.png'} height={20} width={20} className='mr-2 cursor' onClick={() => {
                            let filterdata = []
                            let isSelectAll = CRMCityFilters.every(item => item.is_checked)
                            for (let i = 0; i <= CRMCityFilters.length - 1; i++) {
                              let element = CRMCityFilters[i]
                              filterdata.push({
                                ...element,
                                is_checked: !isSelectAll
                              })
                            }
                            setCRMCityFilters(filterdata);
                          }} />
                          <label className='font-size-14 font-wt-600'>{"All"}</label>
                        </div>
                        {CRMCityFilters.map((item, index) => {
                          return <div className='d-flex flex-row gap-2 mt-2' key={index}>
                            <img src={item.is_checked ? '/assets/images/checked-green.png' : '/assets/images/unchecked-box.png'} height={20} width={20} className='mr-2 cursor' onClick={() => {
                              const updatedTO = [...CRMCityFilters]; // create a new array
                              updatedTO[index] = {
                                ...updatedTO[index],
                                is_checked: !updatedTO[index].is_checked
                              };
                              setCRMCityFilters(updatedTO);
                            }} />
                            <label className='font-size-14 font-wt-600'>{item.name}</label>
                          </div>
                        })}
                      </div>
                    }
                    {selectedFilterIndex === 4 &&
                      <div className='p-3'>
                        {CRMMasterFilter.map((item, index) => {
                          return <div className='d-flex flex-row justify-content-between align-items-center ' key={index}>
                            <div className='d-flex flex-row gap-2 mt-2' key={index}>
                              <img src={item.is_checked ? '/assets/images/checked-green.png' : '/assets/images/unchecked-box.png'} height={20} width={20} className='mr-2 cursor' onClick={() => {
                                const updatedTO = [...CRMMasterFilter]; // create a new array
                                let subFiltersTemp = []
                                for (let i = 0; i <= item.subFilters?.length - 1; i++) {
                                  subFiltersTemp.push({
                                    ...item.subFilters[i],
                                    is_checked: !updatedTO[index].is_checked
                                  })
                                }
                                updatedTO[index] = {
                                  ...updatedTO[index],
                                  is_checked: !updatedTO[index].is_checked,
                                  subFilters: subFiltersTemp
                                }

                                setCRMMasterFilter(updatedTO);
                              }} />
                              <label className='font-size-14 font-wt-600'>{item.name}</label>

                            </div>
                            {item.subFilters?.length ?
                              <img className="cursor" onClick={toggleDropdown} src="assets/images/header/down_arrow.png" style={{ transform: "rotate(-90deg)" }} />
                              : null
                            }
                            <div
                              ref={boxRef}
                              style={{ width: 11 + "rem", left: 14 + "rem", marginTop: `${(isOpen * 4) + 2}rem` }}
                              className={`navPopup2 ${isOpen ? 'd-block' : 'd-none'}`}
                            >
                              {item.subFilters && item.subFilters.map((i, j) => {
                                return (
                                  <div
                                    key={j}
                                    className={`d-flex py-2 align-items-center cursor px-2 ${isOpen2 === j ? ' selectedMenu ' : ''}`}
                                    onClick={() => {
                                      const updatedTO = [...CRMMasterFilter]; // create a new array
                                      let subFiltersTemp = [...item.subFilters]
                                      subFiltersTemp[j].is_checked = !subFiltersTemp[j].is_checked
                                      updatedTO[index] = {
                                        ...updatedTO[index],
                                        is_checked: item.subFilters.some(item => item.is_checked),
                                        subFilters: subFiltersTemp
                                      };
                                      setCRMMasterFilter(updatedTO);
                                    }}
                                  >

                                    <div className='d-flex flex-row gap-2 mt-2' key={index} onMouseEnter={() => {
                                      setIsOpen2(j)
                                    }}
                                      onMouseLeave={() => {
                                        if (!isNaN(isOpen2) && !i.branchedMenus?.length) {
                                          setIsOpen2(false)
                                        }
                                      }}>
                                      <img src={i.is_checked ? '/assets/images/checked-green.png' : '/assets/images/unchecked-box.png'} height={20} width={20} className='mr-2' />
                                      <label className='font-size-14 font-wt-600'>{i.name}</label>

                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        })}
                      </div>
                    }
                    {selectedFilterIndex === 5 &&
                      <div className='p-3'>
                        {CRMOrgTypeFilter.map((item, index) => {
                          return <div className='d-flex flex-row gap-2 mt-2' key={index}>
                            <img src={item.is_checked ? '/assets/images/checked-green.png' : '/assets/images/unchecked-box.png'} height={20} width={20} className='mr-2 cursor' onClick={() => {
                              const updatedTO = [...CRMOrgTypeFilter]; // create a new array
                              updatedTO[index] = {
                                ...updatedTO[index],
                                is_checked: !updatedTO[index].is_checked
                              };
                              setCRMOrgTypeFilter(updatedTO);
                            }} />
                            <label className='font-size-14 font-wt-600'>{item.name}</label>
                          </div>
                        })}
                      </div>
                    }
                    {selectedFilterIndex === 6 &&
                      <div className='p-3 '>
                        <div className='d-flex flex-row gap-2 mt-2' >
                          <img src={CRMCountriesFilters.every(item => item.is_checked) ? '/assets/images/checked-green.png' : '/assets/images/unchecked-box.png'} height={20} width={20} className='mr-2 cursor' onClick={() => {
                            let filterdata = []
                            let isSelectAll = CRMCountriesFilters.every(item => item.is_checked)
                            for (let i = 0; i <= CRMCountriesFilters.length - 1; i++) {
                              let element = CRMCountriesFilters[i]
                              filterdata.push({
                                ...element,
                                is_checked: !isSelectAll
                              })
                            }
                            setCRMCountriesFilters(filterdata);
                          }} />
                          <label className='font-size-14 font-wt-600'>{"All"}</label>
                        </div>
                        {CRMCountriesFilters.map((item, index) => {
                          return <div className='d-flex flex-row gap-2 mt-2' key={index}>
                            <img src={item.is_checked ? '/assets/images/checked-green.png' : '/assets/images/unchecked-box.png'} height={20} width={20} className='mr-2 cursor' onClick={() => {
                              const updatedTO = [...CRMCountriesFilters]; // create a new array
                              updatedTO[index] = {
                                ...updatedTO[index],
                                is_checked: !updatedTO[index].is_checked
                              };
                              setCRMCountriesFilters(updatedTO);
                            }} />
                            <label className='font-size-14 font-wt-600'>{item.name}</label>
                          </div>
                        })}
                      </div>
                    }
                    {selectedFilterIndex === 7 &&
                      <div className='p-3 '>
                        <div className='d-flex flex-row gap-2 mt-2' >
                          <img src={CRMBuyersFilters.every(item => item.is_checked) ? '/assets/images/checked-green.png' : '/assets/images/unchecked-box.png'} height={20} width={20} className='mr-2 cursor' onClick={() => {
                            let filterdata = []
                            let isSelectAll = CRMBuyersFilters.every(item => item.is_checked)
                            for (let i = 0; i <= CRMBuyersFilters.length - 1; i++) {
                              let element = CRMBuyersFilters[i]
                              filterdata.push({
                                ...element,
                                is_checked: !isSelectAll
                              })
                            }
                            setCRMBuyersFilters(filterdata);
                          }} />
                          <label className='font-size-14 font-wt-600'>{"All"}</label>
                        </div>
                        {CRMBuyersFilters.map((item, index) => {
                          return <div className='d-flex flex-row gap-2 mt-2' key={index}>
                            <img src={item.is_checked ? '/assets/images/checked-green.png' : '/assets/images/unchecked-box.png'} height={20} width={20} className='mr-2 cursor' onClick={() => {
                              const updatedTO = [...CRMBuyersFilters]; // create a new array
                              updatedTO[index] = {
                                ...updatedTO[index],
                                is_checked: !updatedTO[index].is_checked
                              };
                              setCRMBuyersFilters(updatedTO);
                            }} />
                            <label className='font-size-14 font-wt-600'>{item.name}</label>
                          </div>
                        })}
                      </div>
                    }
                  </div>
                  <button className={`new-btn-r-0 w-100  py-2 px-2 text-white cursor`} onClick={() => { setRefresh(refresh + 1) }}> Apply Filter</button>
                </div>

              </div>
              <div className='card p-4 w-63 rounded ml-3'>
                <div className="d-flex align-items-center gap-2">
                  <div class="dropdown w-40 cursor" >
                    <div className='d-flex gap-2 align-items-center' id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                      <label class="font-wt-600 font-size-13 mb-0" >
                        {graphdropdown[selectedGraphIndex].label}
                      </label>
                      <img src='assets/images/arrowdown.png' />
                    </div>

                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                      {graphdropdown.map((element, index) => {
                        return <li className="dropdown-item cursor" onClick={() => { setSelectedGraphIndex(index) }}>{element.label}</li>
                      })}
                    </ul>
                  </div>
                </div>
                <div className="pt-4">
                  <CustomLineChart XFormatter={(value) => value} YFormatter={(tab === 'Values' || selectedGraphIndex === 2) ? (value) => "$ " + Intl.NumberFormat('en-US', { notation: 'compact' }).format(value) : (value) => value} bardataConfig={(tab === 'Values' || selectedGraphIndex === 2) ? valuesConfig : bardataConfig} formatterFunction={(tab === 'Values' || selectedGraphIndex === 2) ? (value, name) => ["$ " + Intl.NumberFormat('en-US', { notation: 'compact' }).format(value), name] : (value, name) => [value, label[name]]} data={countryData} xDataKey={(selectedGraphIndex === 2) ? "PRODUCT_TYPE" : "country"} tab={tab} type={"Sum"} />
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  {selectedGraphIndex === 2 ? null
                    : <div className="text-center d-flex flex-row align-items-center justify-content-center">
                      <div >
                        <ul className="nav pricingtabs nav-pills bg-white mx-auto rounded-pill p-0 shadow-sm" id="pills-tab" role="tablist">
                          <li className="nav-item p-0 " role="presentation">
                            <button onClick={() => {
                              setTab("Count")
                            }} className="nav-link active w-100 roundedpillleft font-size-14" id="pills-All-tab" data-bs-toggle="pill" data-bs-target="#pills-All" type="button" role="tab" aria-controls="pills-All" aria-selected="true">Count</button>
                          </li>
                          <li className="nav-item p-0 " role="presentation">
                            <button onClick={() => {
                              setTab("Values")
                            }} className="nav-link w-100 roundedpillright font-size-14 " id="pills-Yearly-tab" data-bs-toggle="pill" data-bs-target="#pills-Yearly" type="button" role="tab" aria-controls="pills-Yearly" aria-selected="false">Values ($)</button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  }

                  <div>
                    {(tab === 'Values' || selectedGraphIndex === 2) ?
                      <label className="paymentsdots"><div className='greendot' /> FOB </label>
                      : <div className="d-flex gap-3">
                        <label className="paymentsdots"><div className='greendot' /> Exporter </label>
                        <label className="paymentsdots"><div className='bluedot' /> Buyers </label>
                      </div>
                    }
                  </div>
                </div>
              </div>

            </div>
            <div className='my-4'>
              <div className='filter-div ml-4 '>
                <Filter setAssignType={setAssignType}
                  selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}
                  filteredSearch={filterSearched} setFilteredSearch={setFilteredSearch}
                  filterData={filterData} setFilterData={setFilterData} showFilterBtn={true}
                  showResultPerPage={true} count={count} filter={filterMaster} setFilter={setMasterFilter} refresh={refreshMaster} setRefresh={setMasterRefresh} showDownloadIcon onDownloadClick={downLoadMasterdata} isAdditionalButton={true} showSelectOption={assignTaskLevel >= 1}>



                  {userType === 'Exporters' &&
                    <div className="d-flex gap-4">
                      <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={() => {
                        if (assignTaskLevel >= 1) {
                          //open popup
                          setshowdropdown(!showdropdown)
                          if (selectedIndex.length === 1) {
                            setData({
                              ...data,
                              leadAssignedTo: overalldata[selectedIndex[0]].TASK_ASSIGNED_TO?.[0]?.id || null,
                              leadAssignedToSec: overalldata[selectedIndex[0]].TASK_ASSIGNED_TO?.[1]?.id || null,
                              foldername: overalldata[selectedIndex[0]].FOLDER_NAME || null,
                            })
                          } else {
                            setData({
                              ...data,
                              leadAssignedTo: null,
                              leadAssignedToSec: null,
                              foldername: null,
                            })
                          }
                        } else {
                          setassignTaskLevel(assignTaskLevel + 1)
                        }
                      }} type='button'>{showdropdown ? 'Assign To' : 'Assign Task'}</button>

                    </div>
                  }

                </Filter>
              </div>
              <div>
                <ExpandableTable
                  overalldata={overalldata}
                  expand={[]}
                  tableExpand={[]}
                  expandKey={"EXPORTER_NAME"}

                  filterData={filterData}
                  setFilterData={setFilterData}
                  filteredSearch={filterSearched}
                  setFilteredSearch={setFilteredSearch}
                  disableAction={true}
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
                      name: "Company Name", width: '15%', filter: true, filterDataKey: 'Company Name',
                      sort: [
                        { name: "Sort A-Z", selected: filterMaster.sortCompanyName === 1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortCompanyName: 1, sortContactPerson: false, sortBuyerCount: false, sortCity: false, sortTurnover: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } },
                        { name: "Sort Z-A", selected: filterMaster.sortCompanyName === -1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortCompanyName: -1, sortContactPerson: false, sortBuyerCount: false, sortCity: false, sortTurnover: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } }]
                    },
                    {
                      name: "Contact person", width: '15%', filter: true, filterDataKey: 'Contact Person',

                    },
                    { name: "Contact no.", width: '10%', filter: true, filterDataKey: 'Contact No' },
                    { name: "Designation", width: '10%', filter: true, filterDataKey: 'Designation' },
                    {
                      name: userType === 'Buyers' ? "Suppliers" : 'Buyers', width: '10%', filter: true, filterDataKey: 'buyersCount',
                      sort: [
                        { name: "Sort Highest", selected: filterMaster.sortBuyerCount === -1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortBuyerCount: -1, sortContactPerson: false, sortCompanyName: false, sortCity: false, sortTurnover: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } },
                        { name: "Sort Lowest", selected: filterMaster.sortBuyerCount === 1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortBuyerCount: 1, sortContactPerson: false, sortCompanyName: false, sortCity: false, sortTurnover: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } }]
                    },
                    {
                      name: "City", width: '10%', filter: true, filterDataKey: 'Exporter City',
                      sort: [
                        { name: "Sort A-Z", selected: filterMaster.sortCity === 1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortCity: 1, sortContactPerson: false, sortBuyerCount: false, sortCompanyName: false, sortCompanyName: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } },
                        { name: "Sort Z-A", selected: filterMaster.sortCity === -1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortCity: -1, sortContactPerson: false, sortBuyerCount: false, sortCompanyName: false, sortCompanyName: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } }]
                    },
                    {
                      name: "Turnover", width: '10%', filter: true, filterDataKey: 'sortTurnover',
                      sort: [
                        { name: "Sort Highest", selected: filterMaster.sortTurnover === -1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortTurnover: -1, sortContactPerson: false, sortBuyerCount: false, sortCity: false, sortCompanyName: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } },
                        { name: "Sort Lowest", selected: filterMaster.sortTurnover === 1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortTurnover: 1, sortContactPerson: false, sortBuyerCount: false, sortCity: false, sortCompanyName: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } }]
                    },
                    {
                      name: "Task Assigned ", width: '10%', filter: true, filterDataKey: 'Lead Assigned To',
                      sort: [
                        { name: "Sort A-Z", selected: filterMaster.sortleadAssigned === 1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortleadAssigned: 1, sortContactPerson: false, sortBuyerCount: false, sortCity: false, sortTurnover: false, sortCompanyName: false }); setMasterRefresh(refreshMaster + 1) } },
                        { name: "Sort Z-A", selected: filterMaster.sortleadAssigned === -1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortleadAssigned: -1, sortContactPerson: false, sortBuyerCount: false, sortCity: false, sortTurnover: false, sortCompanyName: false }); setMasterRefresh(refreshMaster + 1) } }]
                    },
                    { name: "", width: '2%' }
                  ] : [
                    {
                      name: "Company Name", width: '15%', filter: true, filterDataKey: 'Company Name',
                      sort: [
                        { name: "Sort A-Z", selected: filterMaster.sortCompanyName === 1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortCompanyName: 1, sortContactPerson: false, sortBuyerCount: false, sortCity: false, sortTurnover: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } },
                        { name: "Sort Z-A", selected: filterMaster.sortCompanyName === -1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortCompanyName: -1, sortContactPerson: false, sortBuyerCount: false, sortCity: false, sortTurnover: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } }]
                    },
                    {
                      name: "Contact person", width: '15%', filter: true, filterDataKey: 'Contact Person',

                    },
                    { name: "Contact no.", width: '10%', filter: true, filterDataKey: 'Contact No' },
                    { name: "Designation", width: '10%', filter: true, filterDataKey: 'Designation' },
                    {
                      name: userType === 'Buyers' ? "Suppliers" : 'Buyers', width: '10%', filter: true, filterDataKey: 'buyersCount',
                      sort: [
                        { name: "Sort Highest", selected: filterMaster.sortBuyerCount === -1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortBuyerCount: -1, sortContactPerson: false, sortCompanyName: false, sortCity: false, sortTurnover: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } },
                        { name: "Sort Lowest", selected: filterMaster.sortBuyerCount === 1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortBuyerCount: 1, sortContactPerson: false, sortCompanyName: false, sortCity: false, sortTurnover: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } }]
                    },
                    {
                      name: "City", width: '12%', filter: true, filterDataKey: 'Exporter City',
                      sort: [
                        { name: "Sort A-Z", selected: filterMaster.sortCity === 1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortCity: 1, sortContactPerson: false, sortBuyerCount: false, sortCompanyName: false, sortCompanyName: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } },
                        { name: "Sort Z-A", selected: filterMaster.sortCity === -1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortCity: -1, sortContactPerson: false, sortBuyerCount: false, sortCompanyName: false, sortCompanyName: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } }]
                    },
                    {
                      name: "Turnover", width: '10%', filter: true, filterDataKey: 'sortTurnover',
                      sort: [
                        { name: "Sort Highest", selected: filterMaster.sortTurnover === -1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortTurnover: -1, sortContactPerson: false, sortBuyerCount: false, sortCity: false, sortCompanyName: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } },
                        { name: "Sort Lowest", selected: filterMaster.sortTurnover === 1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortTurnover: 1, sortContactPerson: false, sortBuyerCount: false, sortCity: false, sortCompanyName: false, sortleadAssigned: false }); setMasterRefresh(refreshMaster + 1) } }]
                    },
                    {
                      name: "Task Assigned ", width: '10%', filter: true, filterDataKey: 'Lead Assigned To',
                      sort: [
                        { name: "Sort A-Z", selected: filterMaster.sortleadAssigned === 1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortleadAssigned: 1, sortContactPerson: false, sortBuyerCount: false, sortCity: false, sortTurnover: false, sortCompanyName: false }); setMasterRefresh(refreshMaster + 1) } },
                        { name: "Sort Z-A", selected: filterMaster.sortleadAssigned === -1, onActionClick: () => { setMasterFilter({ ...filterMaster, sortleadAssigned: -1, sortContactPerson: false, sortBuyerCount: false, sortCity: false, sortTurnover: false, sortCompanyName: false }); setMasterRefresh(refreshMaster + 1) } }]
                    },
                    { name: "", width: '2%' }
                  ]}
                  data={dbData} />
                <Pagination page={page} perPage={filterMaster.resultPerPage} totalCount={count} onPageChange={(p) => setPage(p)} refresh={refreshMaster} setMasterFilter={setMasterFilter} />

              </div>
            </div>
            <div className='my-4'>
              <div className='col-md-12'>
                <div className='card p-3 dashboard-card border-0 borderRadius h-100'>
                  <div class="dropdown">
                    <div className='d-flex flex-row align-items-center justify-content-between my-3 ml-3'>
                      <div className='d-flex align-items-center '>
                        <label className='text-left font-size-14 font-wt-600 mr-3 mb-0 cursor' onClick={() => setexportTrendSelect('all')}>{`Price History`}</label>

                      </div>

                      <div className='d-flex flex-row align-items-center gap-2'>
                        <div className='pr-3'>
                          <NewInput type={"date"} name={`priceHistoryFrom`} value={graphConfiguration.priceHistoryFrom}
                            onChange={handleGraphConfigurationChange} removeMb />
                        </div>
                        <div className='pr-3'>
                          <NewInput type={"date"} name={`priceHistoryTo`} value={graphConfiguration.priceHistoryTo}
                            onChange={handleGraphConfigurationChange} removeMb />
                        </div>
                        <div className='pr-3'>
                          <img
                            onClick={() => { setGraphTableMode({ ...graphTableMode, priceHistoryGraphMode: !graphTableMode.priceHistoryGraphMode }) }}
                            className='cursor'
                            src={`/assets/images/${graphConfiguration.priceHistoryGraphMode ? 'filterTableMode' : 'filterGraphMode'}.png`} />
                        </div>
                        <div className=''>
                          <img
                            onClick={() => { }}
                            className='cursor' src='/assets/images/download_icon_with_bg.png' />
                        </div>
                      </div>

                    </div>
                  </div>
                  <div className="pt-4">
                    {graphTableMode.priceHistoryGraphMode ?
                      <CustomLineChart XFormatter={(value) => getXAxisDateFormat(graphConfiguration.priceHistoryTo, graphConfiguration.priceHistoryFrom, value)} YFormatter={(value) => "$ " + Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)} bardataConfig={chartconfig} formatterFunction={(value, name) => ["$ " + Intl.NumberFormat('en-US', { notation: 'compact' }).format(value), name]} data={exportTrendgraphdata} xDataKey={"label"} isLegend={true} legendShape={'square'} onLegendClick={(e) => setexportTrendSelect(e.dataKey)} tab={"Values"} type={"Average"} />

                      : <NewTable
                        disableAction={true}
                        columns={graphColumns.priceHistoryGraphColumns}
                        data={priceHistoryTableData}
                      />
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className='my-4'>
              <div className='col-md-12'>
                <div className='card p-3 dashboard-card border-0 borderRadius h-100'>
                  <div class="dropdown">
                    <div className='d-flex flex-row align-items-center justify-content-between my-3 ml-3'>
                      <div className='d-flex align-items-center '>
                        <label className='text-left font-size-14 font-wt-600 mr-3 mb-0 cursor' onClick={() => setexportHistorySelect('all')}>{`Export History`}</label>

                      </div>

                      <div className='d-flex flex-row align-items-center gap-2'>
                        <div >
                          <ul className="nav pricingtabs nav-pills bg-white mx-auto rounded-pill p-0 shadow-sm" id="pills-tab" role="tablist">
                            <li className="nav-item p-0 " role="presentation">
                              <button onClick={() => {
                                setTabExpHistory('Values')
                              }} className="nav-link active w-100 roundedpillleft font-size-14" id="pills-All-tab" data-bs-toggle="pill" data-bs-target="#pills-All" type="button" role="tab" aria-controls="pills-All" aria-selected="true">Values ($)</button>
                            </li>
                            <li className="nav-item p-0 " role="presentation">
                              <button onClick={() => {
                                setTabExpHistory('Count')
                              }} className="nav-link w-100 roundedpillright font-size-14 " id="pills-Yearly-tab" data-bs-toggle="pill" data-bs-target="#pills-Yearly" type="button" role="tab" aria-controls="pills-Yearly" aria-selected="false">Avg Quantity</button>
                            </li>
                          </ul>
                        </div>
                        <div className='pr-3'>
                          <NewInput type={"date"} name={`ExportHistoryFrom`} value={graphConfiguration.ExportHistoryFrom}
                            onChange={handleGraphConfigurationChange} removeMb />
                        </div>
                        <div className='pr-3'>
                          <NewInput type={"date"} name={`ExportHistoryTo`} value={graphConfiguration.ExportHistoryTo}
                            onChange={handleGraphConfigurationChange} removeMb />
                        </div>
                        <div className='pr-3'>
                          <img
                            onClick={() => { setGraphTableMode({ ...graphTableMode, ExportHistoryGraphMode: !graphTableMode.ExportHistoryGraphMode }) }}
                            className='cursor'
                            src={`/assets/images/${graphConfiguration.ExportHistoryGraphMode ? 'filterTableMode' : 'filterGraphMode'}.png`} />
                        </div>
                        <div className=''>
                          <img
                            onClick={() => { }}
                            className='cursor' src='/assets/images/download_icon_with_bg.png' />
                        </div>
                      </div>

                    </div>
                  </div>
                  <div className="pt-4">
                    {graphTableMode.ExportHistoryGraphMode ?
                      <CustomLineChart XFormatter={(value) => getXAxisDateFormat(graphConfiguration.ExportHistoryTo, graphConfiguration.ExportHistoryFrom, value)} YFormatter={(value) => tabExpHistory === 'Values' ? "$ " + Intl.NumberFormat('en-US', { notation: 'compact' }).format(value) : value} bardataConfig={tabExpHistory === 'Values' ? exportchartconfig : quantitychartconfig} formatterFunction={(value, name) => [tabExpHistory === 'Values' ? "$ " + Intl.NumberFormat('en-US', { notation: 'compact' }).format(value) : value, name?.split('_')[0]]} data={exportHistorygraphdata} xDataKey={"label"} isLegend={true} legendShape={'square'} onLegendClick={(e) => setexportHistorySelect(e.dataKey)} tab={tabExpHistory} type={tabExpHistory === 'Values' ? "Sum" : "Average"} />
                      : <NewTable
                        disableAction={true}
                        columns={graphColumns.ExportHistoryGraphColumns}
                        data={exportHistoryTableData}
                      />
                    }
                  </div>
                </div>
              </div>
            </div>
          </>
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
export default connect(mapStateToProps, null)(CRMAssignScreen)