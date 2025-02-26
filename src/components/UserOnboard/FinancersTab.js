import React, { useEffect, useState } from 'react'
import call from '../../service'
import { NewTable } from '../../utils/newTable'
import Filter from '../InvoiceDiscounting/components/Filter'
import Pagination from '../InvoiceDiscounting/contract/components/pagination'
import FinancerDetails from './FinancerDetails'
import UserDetails from './UserDetails'
import { decryptData, encryptData, GetCache, isUserInactive, SetCache } from '../../utils/myFunctions'
import toastDisplay from '../../utils/toastNotification'
import { ToastContainer } from 'react-toastify'
import CommodityAdd from '../registration/commodityAdd'
import axios from 'axios'
import { platformBackendUrl } from '../../urlConstants'
import { companyTypes, industryData } from '../registration/newRegistration'
import GlobalSignup from '../adminNewUI/InvoiceLimit/globalSignup'



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
const FinancersTab = ({ userTokenDetails, setHideTopBar }) => {
  const [summarydata, setSummarydata] = useState({})
  const [filterData, setFilterData] = useState(GetCache("financerTabFilterData"))
  const [filteredSearch, setFilteredSearch] = useState(GetCache("financerTabSearchFilterData"))
  const [refresh, setRefresh] = useState([])
  const [filter, setFilter] = useState(Object.keys(GetCache("financerTabFilter")).length ? GetCache("financerTabFilter") : { resultPerPage: 10, search: '' })
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [showLoader, setShowLoader] = useState(false)
  const [dbData, setDbData] = useState([])
  const [showDetails, setShowDetails] = useState({
    isVisible: false,
    data: {}
  })
  const [salesPerson, setSalesPerson] = useState([])

  const type_id = userTokenDetails?.type_id
  const userPermissionsForSubAdmin = JSON.parse(userTokenDetails.UserAccessPermission || "{}")
  const userId = userTokenDetails?.user_id
  let onlyShowForUserId = (userPermissionsForSubAdmin?.mainAdmin || userPermissionsForSubAdmin?.[`Financier Complete`]) ? undefined : userId

  const updateLeadAssignedTo = (leadAssignedName, userId) => {
    call('POST', 'updateLeadAssignedTo', { leadAssignedName, userId }).then(result => {
      toastDisplay("Lead updated", "success")
      getExportersListForAdmin()
    }).catch(e => {
      toastDisplay("Failed to assign lead to " + leadAssignedName, "error")
    })
  }
  const getexportersummaryAdmin = () => {
    setShowLoader(true)
    call('POST', 'getexportersummaryAdmin', { type_id: 8, onlyShowForUserId }).then(result => {
      setSummarydata(result)
      setShowLoader(false)
    }).catch(e => {
      setShowLoader(false)
    })
  }
  useEffect(() => {
    SetCache("financerTabSearchFilterData", filteredSearch)
  }, [page, refresh, filteredSearch, salesPerson])
  useEffect(() => {
    SetCache("financerTabFilterData", filterData)
    SetCache("financerTabFilter", filter)
    getExportersListForAdmin()
  }, [page, refresh, filterData, salesPerson])
  const getExportersListForAdmin = () => {
    setShowLoader(true)
    let reqObj = {
      resultPerPage: filter.resultPerPage,
      currentPage: page,
      search: filter.search,
      type_id: 8,
      onlyShowForUserId
    }

    for (let index = 0; index < Object.keys(filterData || {}).length; index++) {
      let filterName = Object.keys(filterData)[index]
      const element = filterData[filterName];
      if (element.isFilterActive) {
        if (element.type === "checkbox") {
          reqObj[element.accordianId] = []
          element["data"].forEach((i) => {
            if (i.isChecked) {
              reqObj[element.accordianId].push((element.accordianId === "status" || element.accordianId === "applicationStatus" || element.accordianId === "timeLeft") ? i[element["labelName"]] : `'${i[element["labelName"]]}'`)
            }
          })
        }
        else if (element.type === "minMaxDate") {
          reqObj[element.accordianId] = element["value"]
        }
      }
    }

    call('POST', 'getExportersListForAdmin', reqObj).then(result => {
      setDbData(formatDataForTable(result.message))
      setCount(result.total_count)
      setShowLoader(false)
    }).catch(e => {
      setShowLoader(false)
    })
  }

  useEffect(() => {
    let isCacheExist = localStorage.getItem('financerTabFilterData') != "{}"
    let isSearchCacheExist = localStorage.getItem('financerTabSearchFilterData') != "{}"
    let reqObj = {
      resultPerPage: filter.resultPerPage,
      currentPage: page,
      search: filter.search,
      type_id: 8,
      sub_user_type_id: 22,
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
      //setFilterData(res)
    }).catch(err => { })

  }, [page, refresh, salesPerson])

  useEffect(() => {
    getexportersummaryAdmin()
  }, [])
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
    SetCache("financerTabFilterData", filterData)
    SetCache("financerTabFilter", filter)
    getExportersListForAdmin()
  }, [page, refresh, filterData, salesPerson])
  function formatDataForTable(data) {
    let tableData = []
    let row = []
    data.forEach((item, index) => {
      let isUserInActive = isUserInactive(item.last_login_at)
      row.push(item.company_name)
      row.push(`${item.name_title ? item.name_title : ''} ${item.contact_person ? item.contact_person : ''}`)
      row.push(`${item.phone_code ? "+" + item.phone_code : ''} ${item.contact_number ? item.contact_number : ''}`)
      row.push(item.company_city ? item.company_city : '-')
      row.push(<div class="dropdown w-100" >
        <label class="font-wt-600 font-size-13 cursor" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
          {item.TaskAssignedToName || '-'}
        </label>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
          {salesPerson.map(element => {
            return <li className="dropdown-item cursor" onClick={() => updateLeadAssignedTo(element.id, item.id)} >{element.contact_person}</li>
          })}
        </ul>
      </div>)
      row.push(`${(item.notification_type && item.notification_type !== 'Other') ? item.notification_type : ""} ${item.notification_sub_type ? item.notification_sub_type : ""}`)
      row.push(item.notification_description ? <span className='color3DB16F'>{item.notification_description}</span> :
        isUserInActive ? <span className='colorFE4141'>Inactive</span> : <span className='text2ECC71'>Active</span>)
      row.push(<img src='/assets/images/redirect.svg' className='cursor' onClick={() => {
        setShowDetails({
          isVisible: true,
          data: item
        })
        setHideTopBar(true)

      }} />)
      tableData.push(row)
      row = []
    })
    return tableData
  }

  const [errors, setErrors] = useState({})
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
      setErrors({ ...errors, [event.target.name]: "" })
    }


    // setdata({ ...data, [event.target.name]: event.target.value })
    // setErrors({ ...errors, [event.target.name]: "" })
  }

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
        toastDisplay("User registered successfully", "success")

      }).catch(err => {
        setShowLoader(false)
        toastDisplay(err.message || "Something went wrong", "error");
      })
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
    if (stepperProgress === 0 && !FieldTypes[newData.workField]) {
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
      <div className="row justify-content-between mt-4">
        <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />

        {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
        {showDetails.isVisible &&
          <div className='mt-4'>
            <FinancerDetails data={showDetails.data} goBack={() => {
              setShowDetails({
                isVisible: false,
                data: {}
              })
              setHideTopBar(false)
            }} userTokenDetails={userTokenDetails} />
          </div>
        }
        {!showDetails.isVisible &&
          <>
            <div className='row gap-3 mt-1'>

              <div className="w-15">
                <div className="card py-1 px-4 dashboard-card border-0 borderRadius h-100 justify-content-center me-3">
                  <p className='dasboard-count d-block text-center mb-0 text-color1 mb-1 font-size-22'>{summarydata.total_exporters ? summarydata.total_exporters : 0}</p>
                  <label className='dashboard-name d-block text-center mb-0 cursor font-size-16 font-wt-600'>Financers</label>
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
                      }}>
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
                      }}>
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
                      }}>
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
            </div>

            <div className='my-1'>
              <div className='filter-div ml-4 '>
                <Filter
                  filteredSearch={filteredSearch} setFilteredSearch={setFilteredSearch}
                  filterData={filterData} setFilterData={setFilterData} showFilterBtn={true}
                  showResultPerPage={true} count={count} filter={filter} setFilter={setFilter} refresh={refresh} setRefresh={setRefresh} showDownloadIcon onDownloadClick={() => { }} isAdditionalButton={true} >

                  <div className="d-flex gap-4">
                    <button className={`new-btn  py-2 px-2 text-white cursor`} onClick={() => setboolsignup(true)}>Add New User</button>
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
                <NewTable
                  filteredSearch={filteredSearch}
                  setFilteredSearch={setFilteredSearch}
                  filterData={filterData}
                  setFilterData={setFilterData}
                  disableAction={true}
                  columns={
                    [
                      {
                        name: "Company", filter: true, filterDataKey: "Exporter Name", sort: [
                          { name: "Sort A-Z", selected: filter.sortCompanyName === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: 'ASC', sortContactPerson: false, sortCompanyCity: false, sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } },
                          { name: "Sort Z-A", selected: filter.sortCompanyName === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: 'DESC', sortContactPerson: false, sortCompanyCity: false, sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } }]
                      },
                      {
                        name: "Contact person", filter: true, filterDataKey: "Contact Person", sort: [
                          { name: "Sort A-Z", selected: filter.sortContactPerson === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: 'ASC', sortCompanyCity: false, sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } },
                          { name: "Sort Z-A", selected: filter.sortContactPerson === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: 'DESC', sortCompanyCity: false, sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } }]
                      },
                      {
                        name: "Contact no.", filter: true, filterDataKey: "Contact Number"
                      },
                      {
                        name: "City", filter: true, filterDataKey: "Company City", sort: [
                          { name: "Sort A-Z", selected: filter.sortCompanyCity === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: 'ASC', sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } },
                          { name: "Sort Z-A", selected: filter.sortCompanyCity === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: 'DESC', sortLeadAssignedTo: false, sortByDate: false }); setRefresh(refresh + 1) } }]
                      },
                      {
                        name: "Admin", filter: true, filterDataKey: "Lead Assigned To", sort: [
                          { name: "Sort A-Z", selected: filter.sortLeadAssignedTo === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: false, sortLeadAssignedTo: 'ASC', sortByDate: false }); setRefresh(refresh + 1) } },
                          { name: "Sort Z-A", selected: filter.sortLeadAssignedTo === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: false, sortLeadAssignedTo: 'DESC', sortByDate: false }); setRefresh(refresh + 1) } }]
                      },
                      { name: "Type" },
                      {
                        name: "Status", filter: true, filterDataKey: "StatusFilter", sort: [
                          { name: "Sort Oldest", selected: filter.sortByDate === 'ASC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: false, sortByDate: 'ASC', sortLeadAssignedTo: false }); setRefresh(refresh + 1) } },
                          { name: "Sort Latest", selected: filter.sortByDate === 'DESC', onActionClick: () => { setFilter({ ...filter, sortCompanyName: false, sortContactPerson: false, sortCompanyCity: false, sortByDate: 'DESC', sortLeadAssignedTo: false }); setRefresh(refresh + 1) } }]
                      },
                      { name: "" }
                    ]

                  }
                  data={dbData} />
                <Pagination page={page} perPage={filter.resultPerPage} totalCount={count} onPageChange={(p) => setPage(p)} refresh={refresh} setRefresh={setRefresh} />

              </div>
            </div>
          </>
        }
      </div>
    </>
  )
}

export default FinancersTab