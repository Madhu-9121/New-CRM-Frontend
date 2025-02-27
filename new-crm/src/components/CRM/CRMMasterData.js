import React, { useRef } from 'react'
import { useState } from 'react'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import HeaderV2 from '../partial/headerV2'
import SideBarV2 from '../partial/sideBarV2'
import call from '../../service'
import { useEffect } from 'react'
import ReactCountryFlag from 'react-country-flag'
import toastDisplay from '../../utils/toastNotification'
import moment from 'moment'
import { Calendar } from 'react-calendar';
import { CustomSelect } from '../../utils/newInput'
import { ExportExcel } from '../../utils/myFunctions'
let regions = [
  {
    region_id: 1,
    region: "Africa",
  },
  {
    region_id: 2,
    region: "Americas"
  },
  {
    region_id: 3,
    region: "Asia"
  },
  {
    region_id: 4,
    region: "Europe"
  },
  {
    region_id: 5,
    region: "Oceania"
  }
]
const turnoverRange = [
  { min: "100,000", max: '1 Million', is_checked: false, minVal: 100000, maxVal: 1000000 },
  { min: "1 Million", max: '5 Million', is_checked: false, minVal: 1000000, maxVal: 5000000 },
  { min: "5 Million", max: '10 Million', is_checked: false, minVal: 5000000, maxVal: 10000000 },
  { min: "10 Million", max: 'More', is_checked: false, maxVal: 10000000 }
]
const tabs = [
  // "PC Code",
  "2 Digit",
  "4 Digit",
  "6 Digit",
  "8 Digit"
]

let exportersExcel = [
  {
    "S.No.": "",
    "EXPORTER_NAME": "",
    "EXPORTER_ADDRESS": "",
    "EXPORTER_CITY": "",
    "FoB(in million)": "",
    "HS Code": ""
  }
]

let buyerExcel = [
  {
    "S.No.": "",
    "BUYER_NAME": "",
    "BUYER_ADDRESS": "",
    "BUYER_CITY": "",
    "FoB(in million)": "",
    "HS Code": ""
  }
]

let timefiltersdata = [{ name: 'Overall' }, { name: 'Previous Month' }, { name: 'Previous Week' }, { name: 'Yesterday' }, { name: 'Today' }, { name: 'Current Week' }, { name: 'Current Month' }, { name: 'Custom' }]
const CRMMasterData = ({ userTokenDetails, navToggleState }) => {
  const [showLoader, setShowLoader] = useState(false)
  const [filter, setFilter] = useState({ search: '', resultPerPage: 10, searchHSN: '' })
  const [refresh, setRefresh] = useState(1)
  const [region, setRegion] = useState("Asia")
  const [dbdata, setDbdata] = useState([])
  const [hsndigits, setHSNdigits] = useState('2 Digit')
  const [HS_CODES, setHS_CODES] = useState([])
  const userPermissionsForSubAdmin = JSON.parse(userTokenDetails.UserAccessPermission || "{}")
  const [turnOverFilter, setturnOverFilter] = useState(turnoverRange)
  const [exporterCount, setExporterCount] = useState(0)
  const [selectedDateFilter, setselectedDateFilter] = useState('Overall')
  const [showCalendar, setshowCalendar] = useState(false)
  const [dateRange, setDateRange] = useState()
  const [userType, setuserType] = useState('Exporters')
  const fileRef = useRef(null)
  const box = useRef(null)
  const [isThroughExcel, setisThroughExcel] = useState(false)
  const handleKeyDown = (event) => {
    event.persist();
    if (event.keyCode === 13) {
      setRefresh(refresh + 1)
    }
  }
  const searchMasterdata = (EXPORTER_NAMES) => {
    setisThroughExcel(false)
    setShowLoader(true)
    let reqObj = {
      searchParam: filter.search,
      region_name: region,
      HS_CODES: HS_CODES.filter(item => item.is_checked).map(item => item.HS_CODE),
      turnoverRange: turnOverFilter.filter(item => item.is_checked),
      countFrom: dateRange.from,
      countTo: dateRange.to,
      showExports: userType === 'Exporters',
      showImports: userType === 'Buyers'
    }
    if (EXPORTER_NAMES) {
      reqObj["EXPORTER_NAMES"] = EXPORTER_NAMES
      setisThroughExcel(true)
    }
    call('POST', selectedDateFilter === 'Overall' ? 'getMasterdataV2' : 'searchbuyersV2', reqObj).then(result => {
      console.log('success in getMasterdata', result)
      setDbdata(result.data)
      // let sum = 0
      // for (let i = 0; i <= result?.message?.length - 1; i++) {
      //   let element = result[i]
      //   if (element.total_exporters) {
      //     sum += parseInt(element.total_exporters)
      //   }
      // }
      setExporterCount(result.totalCount)
      setShowLoader(false)
    }).catch(e => {
      console.log('error in getMasterdata', e)
      setShowLoader(false)
    })
  }
  const uploadExcel = async (file) => {
    setShowLoader(true)
    try {
      let formdata = new FormData()
      formdata.append('file', file)
      formdata.append('showImports', userType === 'Buyers')
      const result = await call('POST', 'uploadMasterExcel', formdata)
      searchMasterdata(result)
      //setShowLoader(false)
    } catch (e) {
      console.log('error in uploadExcel', e);
      setShowLoader(false)
    }
  }

  const getHSCodes = (searchparam) => {
    setShowLoader(true)
    const digits = parseInt(hsndigits)
    let searchdata = ""
    if (searchparam) {
      searchdata = searchparam
    } else {
      searchdata = filter.search
    }
    call('POST', 'getHSCodes', { digits, searchparam: searchdata }).then(result => {
      setHS_CODES(result)
      setShowLoader(false)
    }).catch(e => {
      setShowLoader(false)
    })
  }
  const handleOutsideClick = (event) => {
    if (box && box.current && !box.current.contains(event.target)) {
      setshowCalendar(false)
    }
  }
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [])
  useEffect(() => {
    getHSCodes()
  }, [hsndigits])

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
    } else if (selectedDateFilter === 'Overall') {
      startDate = new Date(2020, 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    setDateRange({
      from: moment(startDate).format('YYYY-MM-DD'),
      to: moment(endDate).format('YYYY-MM-DD')
    })

  }, [selectedDateFilter])

  return (

    <div className={"container-fluid"}>
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      <div className="row">

        <SideBarV2 state={"masterdata"} userTokenDetails={userTokenDetails} />
        <main role="main" className={`ml-sm-auto col-lg-10 ` + (navToggleState.status ? " expanded-right" : "")} id="app-main-div">
          <HeaderV2
            title={"Master Data"}
            userTokenDetails={userTokenDetails} />

          <div>
            <>
              <>
                <div className='row gap-3'>
                  <div className='col-md-5 pr-0'>
                    <div className="input-group mb-3 currency col-md-12 pr-0">
                      <span className="input-group-text bg-white border-end-0" id="basic-addon1"><img src={"assets/images/fe_search.png"} alt="search" /></span>
                      <input type="text" name='search' value={filter.search}
                        onKeyDown={handleKeyDown} onChange={(event) => {
                          setFilter({ ...filter, search: event.target.value })
                        }} style={{ height: "50px" }}
                        className="form-control border-start-0" placeholder="Search by HSN Code, Company Name" />
                    </div>

                  </div>
                  <div className='col-md-2 card p-3 dashboard-card border-0 borderRadius' style={{ height: '50px' }}>

                    <div class="dropdown w-100" >
                      <div className='d-flex justify-content-between align-items-center cursor' id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        <label class="font-wt-400 font-size-14 cursor" >
                          {selectedDateFilter}
                        </label>
                        <img src='/assets/images/arrowdown.png' className='ml-2' />
                      </div>

                      <ul class="dropdown-menu w-100" aria-labelledby="dropdownMenuButton1">
                        {timefiltersdata.map(element => {
                          return <li className="dropdown-item cursor font-wt-500 " onClick={() => {
                            let e = element.name
                            if (e === 'Custom') {
                              //setshowCalendar(true)
                              setselectedDateFilter(e)
                            } else {
                              setselectedDateFilter(e)
                              setshowCalendar(false)
                            }
                          }} >{element.name}</li>
                        })}
                      </ul>
                    </div>
                    {showCalendar &&
                      <div className='position-absolute dropdownZindex' ref={box} style={{ right: "0px" }}>
                        <Calendar onChange={(val) => {
                          setDateRange({
                            from: moment(val[0]).format('YYYY-MM-DD'),
                            to: moment(val[1]).format('YYYY-MM-DD')
                          })
                          setshowCalendar(false)
                        }}
                          className="borderRadius border-0 calenderBorder col-md-12"
                          next2Label={null}
                          rev2Label={null}
                          selectRange={true}
                          calendarType={"US"} />
                      </div>


                    }
                  </div>
                  <div className='w-18 card p-3 dashboard-card border-0 borderRadius' style={{ height: '50px' }}>
                    <div className='d-flex flex-row align-items-center' >
                      <div className='d-flex flex-row px-2' onClick={() => setuserType('Exporters')}>
                        <img src={userType === 'Exporters' ? 'assets/images/radio-Select.svg' : 'assets/images/radio-NonSelect.svg'} className='mr-1' />
                        <label className="form-check-label font-size-14 p-0 m-0" >
                          Exporters
                        </label>
                      </div>
                      <div className='d-flex flex-row px-2' onClick={() => setuserType('Buyers')}>
                        <img src={userType === 'Buyers' ? 'assets/images/radio-Select.svg' : 'assets/images/radio-NonSelect.svg'} className='mr-1' />
                        <label className="form-check-label font-size-14 p-0 m-0" >
                          Importers
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className='w-18 pl-0' style={{ height: "50px" }}>
                    <button className={`new-btn w-100 h-100  py-2 px-2 text-white cursor font-size-16 font-wt-600`} onClick={() => {
                      // console.log("userPermissionsForSubAdmin", userPermissionsForSubAdmin);
                      if (userPermissionsForSubAdmin.mainAdmin || userPermissionsForSubAdmin?.["Master Data"]) {
                        searchMasterdata()
                      } else {
                        if (filter.search !== "") {
                          if (isNaN(parseInt(filter.search))) {
                            searchMasterdata()
                          } else {
                            toastDisplay('Only Search By company name allowed for sub admin', "info")
                          }
                        }
                      }

                    }}>Search data</button>
                  </div>
                </div>
                <div className='mt-2 mb-4 text-center d-flex align-items-center justify-content-center gap-4'>
                  <label className='font-size-14 font-wt-500 mb-0'>Upload data (download the template & upload data)</label>
                  <div className='d-flex gap-2 cursor align-items-center cursor' onClick={() => ExportExcel(userType === 'Exporters' ? exportersExcel : buyerExcel, userType === 'Exporters' ? 'Exporter_master_data_upload_Template' : 'Buyer_master_data_upload_Template')}>
                    <img src='assets/images/dwnlBu.svg' width={18} height={18} />
                    <label className='font-size-16 font-wt-600 text-color1 mb-0 cursor'>Download Template</label>
                  </div>
                  <div className='w-13 pl-0' style={{ height: "40px" }}>
                    <button className={`new-btn2 w-100 h-100  py-2 px-2 text-color1 cursor d-flex align-items-center justify-content-around`} onClick={() => {
                      fileRef.current.click()
                    }}>
                      <img src='assets/images/uploadIcon.svg' />
                      <input type="file" id="files" className={"d-none"} ref={fileRef} onChange={(e) => {
                        uploadExcel(e.target.files[0])
                      }} />
                      <label className='font-size-16 font-wt-600 mb-0 cursor'>Upload data</label>
                    </button>
                  </div>
                </div>
                {(userPermissionsForSubAdmin.mainAdmin || userPermissionsForSubAdmin?.["Master Data"]) &&
                  <div className='row mt-2 ml-3'>
                    <div className='card p-4 w-35 rounded '>
                      <div className='d-flex flex-row justify-content-between'>
                        {tabs.map((item, index) => {
                          if (hsndigits === item) {
                            return <div className='' >
                              <button className={`new-btn w-100 h-100  py-1 px-4 text-white cursor`}>{item}</button>
                            </div>
                          } else {
                            return <div className={`${tabs.length - 1 !== index ? 'border-right' : ''} p-2`} onClick={() => { setHSNdigits(item) }}>
                              <label className='font-size-14 font-wt-600'>{item}</label>
                            </div>
                          }

                        })}
                      </div>
                      <div className="input-group mb-3 currency col-md-12 p-0 mt-3">
                        <span className="input-group-text bg-white border-end-0" id="basic-addon1"><img src={"assets/images/fe_search.png"} alt="search" /></span>
                        <input type="text" name='search'
                          onKeyDown={(e) => {
                            e.persist();
                            if (e.keyCode === 13) {
                              getHSCodes(e.target.value)
                            }
                          }}
                          className="form-control border-start-0" placeholder="Search by HSN Code" />
                      </div>
                      <div className='hsndiv'>
                        {HS_CODES.map((item, index) => {
                          console.log('HSFilters', item);
                          return <div className='d-flex flex-row gap-2' >
                            <img src={item.is_checked ? '/assets/images/checked-green.png' : '/assets/images/unchecked-box.png'} height={20} width={20} className='mr-2 cursor' onClick={() => {
                              const updatedHS_CODES = [...HS_CODES]; // create a new array
                              updatedHS_CODES[index] = {
                                ...updatedHS_CODES[index],
                                is_checked: !updatedHS_CODES[index].is_checked
                              };
                              setHS_CODES(updatedHS_CODES);
                            }} />
                            <label className='font-size-14 font-wt-600'>{item.HS_CODE + "-" + item.Description}</label>
                          </div>
                        })}
                      </div>
                    </div>
                    <div className='card p-4 w-30 rounded ml-3' >
                      <div className='d-flex flex-row justify-content-between'>
                        <label className='font-size-14 font-wt-600'>Turnover</label>
                        <img src={'/assets/images/add_black_icon.png'} height={20} width={20} className='mr-2 cursor' />
                      </div>
                      <div className=''>
                        {turnOverFilter.map((item, index) => {
                          return <div className='d-flex flex-row gap-2 mt-2'>
                            <img src={item.is_checked ? '/assets/images/checked-green.png' : '/assets/images/unchecked-box.png'} height={20} width={20} className='mr-2 cursor' onClick={() => {
                              const updatedTO = [...turnOverFilter]; // create a new array
                              updatedTO[index] = {
                                ...updatedTO[index],
                                is_checked: !updatedTO[index].is_checked
                              };
                              setturnOverFilter(updatedTO);
                            }} />
                            <label className='font-size-14 font-wt-600'>{item.min + " - " + item.max}</label>
                          </div>
                        })}
                      </div>
                    </div>
                    <div className='card p-4 w-20 rounded ml-3 h-10'>
                      <div className='text-center'>
                        <div className='d-flex flex-row gap-3'>
                          <img src={'/assets/images/checked-green.png'} height={20} width={20} className='mr-2 cursor' />
                          <label className='font-size-14 font-wt-600 text-decoration-underline'>{`Total ${userType}`}</label>
                        </div>
                        <label className='font-size-14 font-wt-600'>{exporterCount}</label>
                      </div>
                    </div>
                  </div>
                }

                <div className='col-md-12 mt-5'>

                  <div className="p-4 card border-0 rounded-3 ">

                    <div className="p-4 card border-1 rounded-3 m-2">
                      <div className='row'>
                        {regions.map(item => {
                          return <div className={`d-flex flex-row align-items-center w-auto p-2 ${region == item.region ? 'regionDiv' : ''} m-2`} onClick={() => setRegion(item.region)}>
                            <label className='font-size-15 font-wt-400 m-0'>{item.region}</label>
                            <img src='/assets/images/arrowdown.png' className='ml-2' />
                          </div>
                        })}
                      </div>
                      <div className='row'>
                        {dbdata.map(item => {
                          return <div className='text-center col-md-2 p-2 regionDiv m-2' onClick={() => {
                            window.location = '/masterdataAssignment'
                            localStorage.setItem('showDetails', JSON.stringify({
                              show: true,
                              data: item
                            }))
                            localStorage.setItem("searchParam", JSON.stringify(filter))
                            localStorage.setItem('HS_CODES', JSON.stringify(HS_CODES))
                            localStorage.setItem('userType', userType)
                            localStorage.setItem('countFrom', dateRange.from)
                            localStorage.setItem('countTo', dateRange.to)
                            localStorage.setItem('isThroughExcel', isThroughExcel)

                          }}>
                            <ReactCountryFlag
                              countryCode={item.sortname}
                              style={{ width: '50px', height: '50px', "borderRadius": "15px" }} svg />
                            <p className='font-size-14 font-wt-500 m-0'>{item.country}</p>
                            <p className='font-size-14 font-wt-500 m-0'>{item.total_buyers}</p>
                          </div>
                        })}
                      </div>

                    </div>
                  </div>

                </div>
              </>

            </>
          </div>

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
export default connect(mapStateToProps, null)(CRMMasterData) 