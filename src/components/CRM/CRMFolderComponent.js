import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import HeaderV2 from '../partial/headerV2'
import SideBarV2 from '../partial/sideBarV2'
import call from '../../service'
import axios from 'axios'
import { EventsArr, LogsArr } from './CRMDataComponent'
import moment from 'moment'
import FinanceInvoiceModal from '../InvoiceDiscounting/contract/components/financeinvoiceModal'
import { NewInput, NewSelect } from '../../utils/newInput'
import toastDisplay from '../../utils/toastNotification'
import { ToastContainer } from 'react-toastify'
import { FileInput } from '../../utils/FileInput'
import Switch from 'react-switch'

let dataArr = [
  { name: "Lead", val: 'Lead Created', color: 'text-custom2' },
  { name: "User Onboarded", val: 'Lead Created', color: 'text-custom2' },
  { name: "Task", val: 'Create New Task', color: 'color3DB16F' },

  // { name: "Hot", val: 'Hot (30 days or less)', color: 'text-custom2' },
  // { name: "Warm", val: 'Cold (60 days or more)', color: 'text-custom2' },
  // { name: "Cold", val: 'Warm (30-60 days)', color: 'text-custom2' },
  { name: "Not Intrested", val: 'Not Interested', color: 'colorFE4141' },
  { name: 'Lost', val: 'Lead Lost', color: 'text-secondary' }
]


let pendingArr = [
  { name: "Hot", val: 'Hot (30 days or less)', color: 'text-custom2' },
  { name: "Warm", val: 'Cold (60 days or more)', color: 'text-custom2' },
  { name: "Cold", val: 'Warm (30-60 days)', color: 'text-custom2' }
]


let followupArr = [
  { name: "Didn't Connect", val: 'Didnt connect', color: 'text-color1' },
  { name: "Call back", val: 'Call back', color: 'text-color1' },
]

const legends = [
  { name: 'Connected', color: '#2ECC71' },
  { name: 'Not Connected', color: '#FE4141' }
]

const CRMFolderComponent = ({ userTokenDetails, navToggleState }) => {
  const [data, setdata] = useState({})
  const [errors, setErrors] = useState({})
  const [refresh, setRefresh] = useState(0)
  const [filter, setFilter] = useState({ resultPerPage: 10, search: '' })
  const [taskType, setTaskType] = useState('Task Wise')
  const [filterData, setFilterData] = useState({})
  const [includedStatus, setIncludedStatus] = useState([0, 1, 2, 3, 4])
  const [statsdata, setstatsdata] = useState({})
  const [dataStatus, setdataStatus] = useState(dataArr)
  const [pendingStatus, setpendingStatus] = useState(pendingArr)
  const [followupStatus, setfollowupStatus] = useState(followupArr)
  const [EventStatus, setEventStatus] = useState(EventsArr)
  const [LogStatus, setLogStatus] = useState(LogsArr)
  const [page, setPage] = useState(1)
  const [showLoader, setshowLoader] = useState(false)
  const [folderdata, setfolderdata] = useState([])
  const [showdropdown, setshowdropdown] = useState(false)
  const [selectedTask, setSelectedTask] = useState('Call List')
  const [assignmentType, setAssignmentType] = useState('Single')
  const [salesPerson, setSalesPerson] = useState([])
  const [folderparams, setfolderparams] = useState({
    showConfirmation: false,
    adminId: [],
    folder_name: null,
    action: null
  })
  const userId = userTokenDetails?.user_id
  const userPermissionsForSubAdmin = JSON.parse(userTokenDetails.UserAccessPermission || "{}")
  const onlyShowForUserId = userPermissionsForSubAdmin?.mainAdmin ? undefined : userId


  const getOverallCRMTasksStats = () => {
    setshowLoader(true)
    let objectAPI = {
      currentPage: page,
      ...filter,
      resultPerPage: filter.resultPerPage,
      included_status: includedStatus,
      taskType,
      screen_name: "CRM Folder"
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
      let dataStatusArr = []
      let dataCnt = 0
      for (let i = 0; i <= dataStatus.length - 1; i++) {
        let element = dataStatus[i]
        if (element.name === 'Lead') {
          element["count"] = result.leadsCount
          dataCnt += result.leadsCount || 0
        } else {
          const matched = result?.eventResponse?.find(item => item.EVENT_TYPE === element.val)
          if (matched) {
            element["count"] = matched ? matched.total_records : 0
            dataCnt += matched ? matched.total_records : 0
          } else {
            const matcheddata = result?.logsResponse?.find(item => item.LOG_TYPE === element.val)
            element["count"] = matcheddata ? matcheddata.total_records : 0
            dataCnt += matcheddata ? matcheddata.total_records : 0
          }
        }
        dataStatusArr.push(element)
      }

      let pendingStatusArr = []
      let pendingCnt = 0
      for (let i = 0; i <= pendingStatus.length - 1; i++) {
        let element = pendingStatus[i]
        const matched = result?.eventResponse?.find(item => item.EVENT_TYPE === element.val)
        if (matched) {
          element["count"] = matched ? matched.total_records : 0
          pendingCnt += matched ? matched.total_records : 0

        } else {
          const matcheddata = result?.logsResponse?.find(item => item.LOG_TYPE === element.val)
          element["count"] = matcheddata ? matcheddata.total_records : 0
          pendingCnt += matcheddata ? matcheddata.total_records : 0
        }
        pendingStatusArr.push(element)
      }

      let followupStatusArr = []
      let followupCnt = 0
      for (let i = 0; i <= followupStatus.length - 1; i++) {
        let element = followupStatus[i]
        const matcheddata = result?.logsResponse?.find(item => item.LOG_TYPE === element.val)
        element["count"] = matcheddata ? matcheddata.total_records : 0
        followupCnt += matcheddata ? matcheddata.total_records : 0
        followupStatusArr.push(element)
      }

      setdataStatus(dataStatusArr)
      setpendingStatus(pendingStatusArr)
      setfollowupStatus(followupStatusArr)
      setstatsdata({
        followupCnt,
        pendingCnt,
        dataCnt
      })
      setshowLoader(false)
    }).catch(e => {
      setshowLoader(false)

    })
  }

  const getfolderWisedata = () => {

    setshowLoader(true)
    call('POST', 'getfolderWisedata', { onlyShowForUserId: userPermissionsForSubAdmin?.mainAdmin ? undefined : userTokenDetails.usersReportToMe.concat([userId]), search: filter.search }).then((result) => {
      setshowLoader(false)
      setfolderdata(result)
    }).catch(error => {
      setshowLoader(false)
    })
  }

  const handleChange = (event) => {
    event.persist();
    setdata({ ...data, [event.target.name]: event.target.value })
    setErrors({ ...errors, [event.target.name]: "" })
  }

  useEffect(() => {
    if (userPermissionsForSubAdmin.mainAdmin || userPermissionsForSubAdmin?.["Assign Task"]) {
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
  const handleKeyDown = (event) => {
    event.persist();
    if (event.keyCode === 13) {
      setRefresh(refresh + 1)
    }
  }
  const handleFile = (event, isImage) => {
    event.persist()
    if (!event.target.files.length) {
      return null
    }
    else {
      let file_type = event.target.files[0]["type"].toLowerCase()
      console.log('file_type', file_type)
      if (!((file_type.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")))) {
        setErrors({ ...errors, [event.target.name]: "Files with xlsx extension are allowed" })
        return
      }

      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onloadend = async (e) => {
        let fileObj = event.target.files[0]
        let fileDataUrl = e.target.result
        fileObj["filebase64"] = fileDataUrl
        setdata({ ...data, [event.target.name]: fileObj })
        setErrors({ ...errors, [event.target.name]: "" });
      }
    }
  }

  useEffect(() => {
    getfolderWisedata()
    getOverallCRMTasksStats()
  }, [refresh])


  const uploadnewFolder = (assingeeId, assignedIdSec) => {
    setshowLoader(true)
    let reqObj = new FormData()
    reqObj.append('datafile', data.datafile)
    reqObj.append('admins', assignmentType === 'Single' ? assingeeId : `('${assingeeId}','${assignedIdSec}')`)

    reqObj.append('FOLDER_NAME', data.foldername)
    reqObj.append('ASSIGNEE_ID', userTokenDetails?.user_id)
    reqObj.append('ASSIGNEE_NAME', userTokenDetails?.userName)
    reqObj.append('TASK_TYPE', selectedTask)

    call('POST', 'uploadnewFolder', reqObj).then(result => {
      setshowLoader(false)
      toastDisplay("Data Uploaded succesfully", "success")
      setdata({
        ...data,
        datafile: null,
        leadAssignedTo: null,
        leadAssignedToSec: null
      })
      setshowdropdown(false)
      getfolderWisedata()
    }).catch(e => {
      setshowLoader(false)
    })
  }

  const assignCallListFolders = (adminId, folder_name, action) => {
    setshowLoader(true)
    call('POST', 'assignCallListFolders', { userId: adminId, activeFolderName: folder_name, action }).then(result => {
      setshowLoader(false)
      getfolderWisedata()
    }).catch(e => {
      setshowLoader(false)
    })
  }
  return (
    <div>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      {folderparams.showConfirmation &&
        <FinanceInvoiceModal limitinvoice={folderparams.showConfirmation} headerTitle={''} modalSize={"md"} closeSuccess={() => {
          setfolderparams({
            showConfirmation: false,
            adminId: null,
            folder_name: null,
            action: null
          })
        }}>
          <div className='text-center col-md-12'>
            <img src='assets/images/Questionmark.png' />
            <div className='py-2'>
              <p>
                <span className='font-size-16 font-wt-500'>{`Do you want to ${folderparams.action ? 'add' : 'remove'} `}</span>
                <span className='color3DB16F font-size-16 font-wt-500'>{`${folderparams.folder_name}`}</span>
                <span className='font-size-16 font-wt-500'>{` ${folderparams.action ? 'to' : 'from'} task list?`}</span>
              </p>
              <label className='font-size-12 font-wt-500 colorFE4141'>*Folders Enabled by Super Admin/Manager can't be disabled by the user</label>

            </div>
            <div className='d-flex gap-2 justify-content-center'>

              <button className={`new-btn2 w-30 py-2 px-2 text-color1 cursor`} onClick={() => {
                if (folderparams.action) {
                  folderparams.adminId.forEach(item => {
                    assignCallListFolders(item, folderparams.folder_name, folderparams.action)
                  })
                }
                setfolderparams({
                  showConfirmation: false,
                  adminId: null,
                  folder_name: null,
                  action: null
                })
              }}>{folderparams.action ? 'Yes' : 'No'}</button>
              <button className={`new-btn w-30 py-2 px-2 text-white cursor`} onClick={() => {
                if (!folderparams.action) {
                  folderparams.adminId.forEach(item => {
                    assignCallListFolders(item, folderparams.folder_name, folderparams.action)
                  })
                }
                setfolderparams({
                  showConfirmation: false,
                  adminId: null,
                  folder_name: null,
                  action: null
                })
              }}>{folderparams.action ? 'No' : 'Yes'}</button>
            </div>
          </div>
        </FinanceInvoiceModal>
      }
      {showdropdown &&
        <FinanceInvoiceModal limitinvoice={showdropdown} headerTitle={''} modalSize={"md"} closeSuccess={() => {
          setshowdropdown(false)
          setdata({
            ...data,
            datafile: null,
            leadAssignedTo: null,
            leadAssignedToSec: null
          })
        }}>
          <div>

            <label className="font-size-16 font-wt-600 text-color-value text-center w-100" >{'Upload Data'}</label>
            <div className="col-md-12 pt-1 ">
              <div className="col-md-12 px-0">
                <FileInput name={"datafile"} value={data.datafile} error={errors.datafile}
                  onChange={handleFile} isEditable={true}
                  onUploadCancel={() => setdata({ ...data, "datafile": null })} />
              </div>
            </div>
            {data.datafile ?
              <>
                <div className='mt-3'>
                  <div className="col-md-12 pt-1 ">
                    <div className="col-md-12 px-0">
                      <NewInput isAstrix={true} type={"text"} label={"Folder Name"}
                        name={"foldername"} value={data.foldername}
                        onChange={handleChange} />
                    </div>
                  </div>

                </div>
                <label className='font-size-14 text-decoration-underline pl-3'>Task Type</label>
                <div className='d-flex flex-row align-items-center pl-2' >
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
                <label className='font-size-14 text-decoration-underline mt-3 pl-3'>Assignment Type</label>

                <div className='d-flex flex-row align-items-center pl-2' >
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
              </>
              : <>
                <div className="col-md-12 d-flex justify-content-center mt-3" >
                  <h6 className=''>
                    <a className="text-dark cursor-pointer" href="./assets/docs/crmdatatemplate.xlsx"
                      target="_blank" download>
                      <img className='mr-2' src="assets/images/xls_file_icon.svg" alt="" width="45" height="45"></img>
                      {"Download Template"}</a>
                  </h6>
                </div>
              </>
            }



            <div className='w-100 text-center'>
              <button type="button disabled"
                onClick={() => {
                  if (data.datafile) {
                    if (data.leadAssignedTo) {
                      if (data.foldername) {
                        uploadnewFolder(data.leadAssignedTo, data.leadAssignedToSec)
                      } else {
                        toastDisplay("Folder name cannot be empty", "info")
                      }

                    } else {
                      toastDisplay("Select sub admin", "info")
                    }
                  } else {
                    toastDisplay("Please upload a file to continue", "info")
                  }
                }}
                className={`w-60 py-2 px-3  ${!data.datafile ? 'new-btn-secondary text-black mt-4' : 'new-btn text-white'}`}>
                {data.datafile ? "Assign Task" : "Add data"}
              </button>
            </div>

          </div>
        </FinanceInvoiceModal>
      }
      <div className="row">

        <SideBarV2 state={"CRMdata"} userTokenDetails={userTokenDetails} />
        <main role="main" className={`ml-sm-auto col-lg-10 ` + (navToggleState.status ? " expanded-right" : "")} id="app-main-div">

          <HeaderV2
            title={"CRM Folder"}
            userTokenDetails={userTokenDetails} />

          <div>
            <div className='row mt-3 pl-2'>
              <div className='w-50  pl-0'>
                <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                  <label className='w-100 font-size-14 text-color-value font-wt-600 pt-2 text-left'>{`Data - `}
                    <label className='font-size-14 text-color-value font-wt-600 text-color1'>{statsdata.dataCnt || 0}</label></label>
                  <div className='row px-0 w-100'>
                    {dataStatus.map(item => {
                      return <div className='w-20 cursor'>
                        <label className={`value font-wt-600  w-100 cursor ${item.color}`}>
                          {item.count || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{item.name}</label>
                      </div>
                    })}
                  </div>
                </div>
              </div>

              <div className='w-25 '>
                <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                  <label className='w-100 font-size-14 text-color-value font-wt-600 pt-2 text-left'>{`Follow Up Task - `}
                    <label className='font-size-14 text-color-value font-wt-600 text-color1'>{statsdata.followupCnt || 0}</label></label>
                  <div className='row px-0 w-100'>
                    {followupStatus.map(item => {
                      return <div className='w-50 cursor'>
                        <label className={`value font-wt-600  w-100 cursor ${item.color}`}>
                          {item.count || 0}
                        </label>
                        <label className={'font-size-14 font-wt-700 text-color-value cursor'}>{item.name}</label>
                      </div>
                    })}
                  </div>
                </div>
              </div>

              <div className='w-25'>
                <div className='card h-75 dashboard-card shadow-sm align-items-center justify-content-center'>
                  <label className='w-100 font-size-14 text-color-value font-wt-600 pt-2 text-left'>{`Pending Task - `}
                    <label className='font-size-14 text-color-value font-wt-600 text-color1'>{statsdata.pendingCnt || 0}</label></label>
                  <div className='row px-0 w-100'>
                    {pendingStatus.map((item, index) => {
                      return <div className='w-33 cursor'>
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
            <div className='d-flex flex-row justify-content-between align-items-center pb-4'>
              <label className='font-size-16 font-wt-600 mb-0'>Task Folder</label>
              <div className='d-flex'>
                {legends.map((i, j) => {
                  return (<div className='d-flex align-items-center mx-2' >
                    <div style={{ background: i.color, height: '16px', width: '16px', borderRadius: 1000 }} />
                    <label className='font-size-14 font-wt-500 mt-2 mx-2' >{i.name}</label>
                  </div>)
                })}
              </div>
              <div className={`input-group mb-3 col-md-4 currency mt-3 pe-1`}>
                <span className="input-group-text bg-white border-end-0" id="basic-addon1"><img src={"assets/images/fe_search.png"} alt="search" /></span>
                <input type="text" name='search' value={filter?.search}
                  onKeyDown={handleKeyDown} onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="form-control border-start-0" placeholder="Search" />
              </div>
              <div className='w-13 pl-0' style={{ height: "40px" }}>
                <button className={`new-btn w-100 h-100  py-2 px-2 text-color1 cursor d-flex align-items-center justify-content-around`} onClick={() => {
                  setshowdropdown(true)
                }}>
                  <img src='assets/images/uploadwhite.svg' />
                  <label className='font-size-16 font-wt-600 mb-0 cursor text-white'>Upload data</label>
                </button>
              </div>
            </div>
            <div className='d-flex gap-5 flex-wrap'>
              {folderdata.map((item, index) => {
                return <div className='card w-30-7 p-4'>
                  <div className='d-flex flex-row align-items-start justify-content-between'>
                    <div >
                      <label className='font-size-15 font-wt-600'>{item.folder_name || 'Default'}</label>
                      <div className='d-flex flex-row'>
                        <label className='font-size-12 text-secondary'>Data category :</label>
                        <label className='font-size-12 text-secondary'>{item.filters?.map(item => item.name).join(" | ")}</label>
                      </div>
                    </div>
                    <div className='d-flex flex-row gap-3 align-items-center'>
                      <Switch height={25} width={45} checked={item?.tasks?.every(ele => ele.isActive)} uncheckedIcon={false} checkedIcon={false} offColor='#D5D5D5' onColor='#5CB8D3' onChange={() => {
                        let userIds = []
                        item?.tasks?.forEach(ele => {
                          if (ele.tbl_user_id) {
                            userIds.push(ele.tbl_user_id)
                          }
                        })
                        setfolderparams({
                          showConfirmation: true,
                          adminId: userIds,
                          folder_name: item.folder_name,
                          action: !item?.tasks?.every(ele => ele.isActive)
                        })
                      }} />
                      <img src='/assets/images/redirect.svg' className='cursor' height={25} width={25} onClick={() => {
                        window.location = `/crmdatalist?search=${filter.search}`
                        localStorage.setItem('folderName', item.folder_name || 'Default')
                        localStorage.setItem('folderdetails', JSON.stringify(item))
                      }} />
                    </div>
                  </div>
                  <div className='d-flex flex-row align-items-start justify-content-between border-bottom mt-3'>
                    <label className='font-size-13'>Data Count</label>
                    <label className='font-size-13 font-wt-600'>{item.assignedCounts || '-'}</label>
                  </div>
                  <div className='d-flex flex-row align-items-start justify-content-between border-bottom mt-3'>
                    <label className='font-size-13'>Assigned By</label>
                    <label className='font-size-13 font-wt-600'>{item.assigned_by || '-'}</label>
                  </div>
                  <div className='d-flex flex-row align-items-start justify-content-between mt-2'>
                    <label className='font-size-13'>Assigned On</label>
                    <label className='font-size-13 font-wt-600'>{item.assigned_at ? moment(item.assigned_at).format('Do MMM YY hh:mm A') : '-'}</label>
                  </div>
                  <div className='mt-3'>
                    <label className='font-size-12 font-wt-600 text-decoration-underline'>Further Assigned To</label>
                    {item?.tasks?.map((ele, j) => {
                      return <div className='d-flex flex-row justify-content-between'>
                        <div className='col-md-6 px-0'>
                          <label className='font-wt-400 font-size-13'>{ele.contact_person}</label>
                        </div>
                        <div className='d-flex flex-row justify-content-between col-md-4'>
                          <label className='fc-3DB16F font-wt-600 font-size-14' title='Exporters Connected'>{ele.connected_exporters}</label>
                          <label className='colorFE4141 font-wt-600 font-size-14' title='Exporters Not Connected'>{ele.not_connected_exporters}</label>
                        </div>
                        <div>
                          <Switch height={25} width={45} checked={ele.isActive} uncheckedIcon={false} checkedIcon={false} offColor='#D5D5D5' onColor='#5CB8D3' onChange={() => {
                            if (!userTokenDetails.usersReportToMe?.includes(ele.tbl_user_id) && !userPermissionsForSubAdmin.mainAdmin) {
                              return toastDisplay('action not permitted', 'info')
                            }
                            setfolderparams({
                              showConfirmation: true,
                              adminId: [ele.tbl_user_id],
                              folder_name: item.folder_name,
                              action: !ele.isActive
                            })
                          }} />
                        </div>
                      </div>
                    })}
                  </div>
                </div>
              })}
            </div>
          </div>
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
export default connect(mapStateToProps, null)(CRMFolderComponent)
