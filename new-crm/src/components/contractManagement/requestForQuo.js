import React, { useState, useEffect, useRef } from "react";
import { connect } from 'react-redux';
import SideBarV2 from "../partial/sideBarV2";
import HeaderV2 from "../partial/headerV2";
import { ToastContainer } from "react-toastify";
import NewTablev2 from "../../utils/newTablev2";
import Filter from "../InvoiceDiscounting/components/Filter";
import { InputForTable, InputWithSelectForTable, NewInput, NewSelect, NewTextArea, NewTextAreaForTable, SelectForTable } from "../../utils/newInput";
import { platformBackendUrl, platformURL } from "../../urlConstants";
import axios from "axios";
import { handleFileCommonFunction, most_used_currencies, multiSelectEventHandler, printDiv } from "../../utils/myFunctions";
import call from "../../service";
import toastDisplay from "../../utils/toastNotification";
import avatarUrl from "../../utils/makeAvatarUrl";
import FinanceInvoiceModal from "../InvoiceDiscounting/contract/components/financeinvoiceModal";
import { FileInput } from "../../utils/FileInput";
import SignDocument, { signFonts } from "../InvoiceDiscounting/components/SignDocument";
import DropdownSearch from "../tallyReports/Cards/dropdownWithSearch";
import AddNewBuyerPopUp from "./addnewBuyerPopUp";
import MultipleSelect from "../../utils/MultipleSelect";
import { getBulkBreakMailTemplate } from "../commodityFormandMaster/BulkBreakTemplate";
import columns from "../dataTablesColumsMap/CreditLinebyAdmin";
import Pagination from '../InvoiceDiscounting/contract/components/pagination';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FilterGlobal from "../InvoiceDiscounting/components/filterGlobal";
import FilterNew from "../InvoiceDiscounting/components/FilterNew";
import AddNewCommodityPopup from "../commodityFormandMaster/addCommodityPopUp";


let invItemsTable = [{ subColumns: "SR. NO.", subColumnStyle: { width: '7%' } },
{ subColumns: "ITEM DESCRIPTION", subColumnStyle: { width: '20%' } },
{ subColumns: "HSN NO.", subColumnStyle: { width: '10%' } },
{ subColumns: "QUANTITY", subColumnStyle: { width: '10%' } },

]

const tablecol = [
  { subColumns: "Select", width: "3rem", },
  { subColumns: "Company", width: "10rem", },
  { subColumns: "Contact No", width: "5rem" },
  { subColumns: " Company Address ", width: "12rem" },
  { subColumns: " Commodity Type ", width: "10rem" },
  { subColumns: " Contact Person ", width: "10rem" },
  { subColumns: " Email Id ", width: "10rem" }

]
let chargesTable = [{ subColumns: "CHARGE TITLE", subColumnStyle: { width: '42.5%' } }, { subColumns: "AMOUNT", subColumnStyle: { width: '45%' } }]

const RequestForQuotation = ({ setEditDocument = {}, setSelectedDocument = {}, docType, setrefresh, editDocument = {}, userTokenDetails, navToggleState, selectedInvoiceData, buyerDetails, sellerDetails, handleGoBack, setSelectedBuyer }) => {
  const queryParams = new URLSearchParams(window.location.search)
  let serarchParam = queryParams.get('search')
  console.log("aaa buyer seller", buyerDetails, sellerDetails)
  console.log("aaa edit doc ", editDocument)

  const userTypeId = userTokenDetails?.type_id ? userTokenDetails.type_id : null
  const userEmail = userTokenDetails?.email ? userTokenDetails.email : null
  const userId = userTokenDetails?.user_id ? userTokenDetails.user_id : null
  const userName = userTokenDetails?.userName ? userTokenDetails.userName : null
  const subUserId = userTokenDetails?.sub_user_id ? userTokenDetails.sub_user_id : null;
  const parentData = userTokenDetails?.parent_data ? userTokenDetails.parent_data : null;
  const [showLoader, setshowLoader] = useState(false)
  const [filter, setFilter] = useState({ resultPerPage: 10, search: serarchParam ? serarchParam : '' })
  const [filterData, setFilterData] = useState({})
  const [count, setCount] = useState(0)
  const [refresh, setRefresh] = useState(0)
  const [showAddCommodityPopup, setShowAddCommodityPopup] = useState(false);
  const [updateStockItems, setUpdateStockItems] = useState(0)

  const [page, setPage] = useState(1)
  // #3
  const [data, setData] = useState(editDocument ? {
    invCurrency: 'USD', invChargeTitle0: "SUBTOTAL", invChargeTitle1: 'HANDLING', nviChargeTitle2: 'FREIGHT',
    invChargeTitle3: 'MISC.', ...editDocument, RFQDate: new Date().toISOString().split('T')[0]
  } : {
    invCurrency: 'USD', invChargeTitle0: "SUBTOTAL", invChargeTitle1: 'HANDLING', nviChargeTitle2: 'FREIGHT',
    invChargeTitle3: 'MISC.', status: 0, RFQDate: new Date().toISOString().split('T')[0],
    companyContactNo: buyerDetails?.companyContactNo, companyEmailId: buyerDetails?.companyEmailId, companyWebsite: buyerDetails?.companyWebsite, originAddress: buyerDetails?.address, companyName: buyerDetails?.companyName,

    finalDestination: sellerDetails?.address, shipToContactNo: buyerDetails?.companyContactNo, shipToEmailId: buyerDetails?.companyEmailId, shipToCompanyName: buyerDetails?.companyName, shipToContactName: buyerDetails?.contactName
  })
  const [supplierArr, setSupplierArr] = useState([])
  const [supplierIdList, setSupplierList] = useState([])
  const [selectedSuppliersDetails, setSelectedSuppliersDetails] = useState([])
  const [inputValue, setInputValue] = useState('');
  const [error, setErrors] = useState({})
  const [countrys, setCountrys] = useState([])
  const [invItems, setInvItems] = useState([null])
  const [invOther, setInvOther] = useState([null, null, null, null])
  const [preview, setPreview] = useState(editDocument ? { show: editDocument.itemStatus === 1 ? false : true } : {})
  const [showPopup, togglePopup] = useState(false)
  const [signdoc, setSigndoc] = useState(false);
  const [RFQNumber, setRFQNumber] = useState(editDocument.RFQNumber || '')
  const [mstCommList, setMstCommList] = useState([])
  const [termsConditions, setTermsConditions] = useState([{ id: Date.now(), value: '' }]);
  const [editSeller, setEditingSeller] = useState(true)
  const [editBuyer, setEditingBuyer] = useState(true)
  const [editingDeliveryLocation, setEditingDeliveryLocation] = useState(true)
  const [editingPos, setEditingPos] = useState(true)
  const [removeDeliveryLocation, setRemoveDeliveryLocation] = useState(false)
  const [removePos, setRemovePos] = useState(false)
  const [changeBuyer, setChangeBuyer] = useState(false)
  const [editingTandC, setEditingTandC] = useState(true)
  const [editingRemarks, setEditingRemarks] = useState(true)
  const [editingInternalNotes, setEditingInternalNotes] = useState(true)
  const [editingClinetNotes, setEditingClinetNotes] = useState(true)
  const [removeRemarks, setRemoveRemarks] = useState(editDocument.remarks ? false : true)
  const [removeTandC, setRemoveTandC] = useState(editDocument.tandc1 ? false : true)
  const [removeInternalNotes, setRemoveInternalNotes] = useState(editDocument.internalNotes ? false : true)
  const [removeClinetNotes, setRemoveClinetNotes] = useState(editDocument.clinetNotes ? false : true)
  const [disableSaveandDraft, setDisableSaveandDraft] = useState(true)
  const [dbData, setDbData] = useState([])
  const [commodityTypes, setCommodityTypes] = useState([])
  const [toggleemail, settogglemmail] = useState(false);
  const [boolSuppliers, setBoolSuppliers] = useState(false)
  const [printbool, setprintbool] = useState(false)
  const [allContactNames, setallcontactName] = useState()
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setData(prev => ({ ...prev, companyLogo: e.target.files[0] }));
    }
  };
  let jj = -1
  let kk = -1
  function addNewTermCondition() {
    setTermsConditions([...termsConditions, { id: Date.now(), value: '' }]);
  }
  const saveToDb = async (type) => {
    data.RFQNumber = RFQNumber
    if (!data.orderDate) {
      data.orderDate = new Date().toISOString().split('T')[0]
    }
    const objectAPI = {
      userId: userId,
      docType: docType || "",
      status: editDocument.itemStatus || type === "new" ? 0 : 1,
      docId: data.RFQNumber,
      data: data,
      sellerId: editDocument ? editDocument["sellerId"] : supplierIdList ? JSON.stringify(supplierIdList) : null,
      buyerId: editDocument ? editDocument["buyerId"] : userTokenDetails.sub_user_id,
      // sellerId: editDocument ? editDocument["buyerId"] : sellerDetails.companyId,
      // // buyerId: editDocument ? editDocument["sellerId"] : buyerDetails?.companyId,
      // // sellerId: editDocument ? editDocument["buyerId"] : supplierIdList,
      // buyerId: editDocument ? editDocument["sellerId"] : userTokenDetails.sub_user_id,
      appLink: "",
      appId: editDocument ? editDocument["idFromDB"] : ""
    }
    console.log("objectAPI", objectAPI, sellerDetails)
    if (editDocument) {
      if (type === "draft" && editDocument.itemStatus === 1) {
        objectAPI.status = 1
      }
      if (type === "new" && editDocument.itemStatus === 1) {
        objectAPI.status = 0
      }
      if (editDocument.addingSQ) {
        // this condition for only if doc is coming from sq and saved as draft
        if (type === "draft") objectAPI.status = 1
        objectAPI.transaction_timeline = { ...editDocument.transaction_timeline, " Request Quotation": new Date().toLocaleString() }
        await call('POST', 'createSalesPurchaseQuotation', objectAPI)
          .then((result) => {
            console.log(result)
          })
          .catch((e) => console.log("error in saving into db", e))
      }
      else {
        objectAPI.transaction_timeline = { "Request Quotation": new Date().toLocaleString() }
        await call('POST', 'updateSalesPurchaseQuotation', objectAPI)
          .then((result) => {
            console.log(result)
          })
          .catch((e) => console.log("error in saving into db", e))
      }
      // await call('POST', 'updateSalesPurchaseQuotation', objectAPI)
      //   .then((result) => {
      //     console.log(result)
      //   })
      //   .catch((e) => console.log("error in saving into db", e))
    } else {
      console.log("new entry")
      objectAPI.transaction_timeline = { "Request Quotation": new Date().toLocaleString() }
      await call('POST', 'createSalesPurchaseQuotation', objectAPI)
        .then((result) => {

          console.log(result)
        })
        .catch((e) => console.log("error in saving into db", e))
    }

    setrefresh(prev => prev + 1)
    handleGoBack()

  }


  // useEffect(() => {
  //   if (sellerDetails?.companyName) {
  //     // Update supplier array with the new supplier
  //     const updatedSupplierArr = [...supplierArr, sellerDetails];
  //     setSupplierArr(updatedSupplierArr);
  //     setSupplierList([...supplierIdList, sellerDetails?.companyId])
  //     // Generate dynamic key for clientCompanyName (e.g., clientCompanyName0, clientCompanyName1, etc.)
  //     const newClientCompanyKey = `clientCompanyName${updatedSupplierArr.length - 1}`;
  //     const newClientContact = `clientContactNo${updatedSupplierArr.length - 1}`
  //     const newClientEmail = `clientEmailId${updatedSupplierArr.length - 1}`

  //     // Update the data state with the new clientCompanyName key and value
  //     setData(prevData => ({
  //       ...prevData,
  //       [newClientCompanyKey]: sellerDetails.companyName,
  //       [newClientContact]: sellerDetails.companyContactNo,
  //       [newClientEmail]: sellerDetails.companyEmailId
  //     }));
  //   }
  // }, [sellerDetails]);

  console.log(supplierArr, "this is arr--->>>", supplierIdList)

  useEffect(() => {
    if (buyerDetails || sellerDetails) {
      setData(prevData => ({
        ...prevData,
        companyContactNo: buyerDetails?.companyContactNo,
        companyEmailId: buyerDetails?.companyEmailId,
        companyWebsite: buyerDetails?.companyWebsite,
        originAddress: buyerDetails?.address,
        companyName: buyerDetails?.companyName,
        finalDestination: sellerDetails?.address,
        shipToContactNo: buyerDetails?.companyContactNo,
        shipToEmailId: buyerDetails?.companyEmailId,
        shipToCompanyName: buyerDetails?.companyName,
        shipToContactName: buyerDetails?.contactName,
        clientContactName: allContactNames
        // clientCompanyName: sellerDetails?.companyName,
        // clientEmailId: sellerDetails?.companyEmailId,
        // clientContactNo: sellerDetails?.companyContactNo,
        // clientAddress: sellerDetails?.address,

      }))
    };
  }, [buyerDetails, sellerDetails]);


  useEffect(() => {
    if (editDocument) {
      setDisableSaveandDraft(false)
      const tandcEntries = Object.entries(editDocument)
        .filter(([key]) => /^tandc\d+$/.test(key)) // Regex to match "tandc1", "tandc2", etc.
        .map(([key, value]) => ({ key, value }));

      setTermsConditions(tandcEntries);
      const itemDescCount = Object.keys(editDocument).filter(key => /^itemDesc\d+$/.test(key)).length;

      setInvItems(itemDescCount ? Array(itemDescCount).fill(null) : [null]);

    }
  }, [editDocument]);
  const handleCommodityChange = (selectedCommodity, j) => {
    // console.log(selectedCommodity, j)

    if (selectedCommodity === "Add New Commodity") {
      // Trigger the popup for adding a new commodity
      setShowAddCommodityPopup(true);
      return;
    }
    const selectedItem = mstCommList.find(
      (comm) => comm.commodity_pretty_name === selectedCommodity
    );
    // console.log("selectedItem:", selectedItem)
    if (selectedItem) {
      setData((prevData) => ({
        ...prevData,
        [`itemDesc${j}`]: selectedItem.commodity_pretty_name,
        [`itemHSN${j}`]: selectedItem.hsn,
        // [`itemTax%${j}`]: parseFloat(selectedItem.gstRate) || 0,
        [`itemQuantityUnits${j}`]: selectedItem.unit,
        // [`itemUnitPrice${j}`]: selectedItem.procured.length ? selectedItem.procured[0]["rate"] : 0

      }));
      setCommodityTypes([...commodityTypes, selectedItem.commodity_pretty_name])
    }
    // const updatedItems = invItems.map((item, i) => {
    //   if (i === index) {
    //     const selectedItem = mstCommList.find(
    //       (comm) => comm.commodity_pretty_name === selectedCommodity
    //     );
    //     return {
    //       ...item,
    //       commodity_pretty_name: selectedItem.commodity_pretty_name,
    //       hsn: selectedItem.hsn,
    //       gst: selectedItem.gst,
    //     };
    //   }
    //   return item;
    // });
    // setInvItems(updatedItems);
  };
  function generateSalesQuotationNumber() {
    const now = new Date();

    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    // ${year}
    const docNumber = `RFQ${month}${day}${hours}${minutes}${seconds}`;

    return docNumber;
  }
  // get commodities



  useEffect(() => {
    if (selectedInvoiceData?.docData) {
      setData(selectedInvoiceData.docData?.data)
      setInvItems(selectedInvoiceData.docData?.invItems)
      setInvOther(selectedInvoiceData.docData.invOther)
    }
    const uniqDocNumber = generateSalesQuotationNumber()
    data.RFQNumber = uniqDocNumber
    if (!RFQNumber) setRFQNumber(uniqDocNumber)
  }, [])

  useEffect(() => {
    axios.get(platformBackendUrl + "/getallCountry").then((result) => {
      if (result.data.message && result.data.message.length) {
        setCountrys(result.data.message);
      }
    });
    setTimeout(() => {
      call('POST', 'getusercommoditylist', { userId }).then((result) => {
        console.log("result in getCommodityList-->", result)
        setMstCommList(result || [])
      }).catch((e) => {
        console.log('error in getCommodityList', e);
      })
    }, 2000)
  }, [updateStockItems, showAddCommodityPopup]);

  async function handleChange(e, i) {
    e.persist()
    const { name, value } = e.target;
    const updatedData = { ...data, [name]: value };
    const updatedTermsConditions = [...termsConditions];
    // if (e.target.name.includes(`invSubTotalAmount`)) {
    //   console.log("looged")
    //   let invTotalAmount1 = 0
    //   for (let index = 0; index < invOther.length; index++) {
    //     let amountToAdd = data[`invSubTotalAmount${index}`] || 0
    //     if (invOther[index] === null) {
    //       invTotalAmount1 += amountToAdd / 1
    //     }
    //   }
    //   console.log("invTotalAmount1 || invTotalAmount", invTotalAmount1)
    //   updatedData['invTotalAmount'] = invTotalAmount1

    // }
    if (name === 'tandc') {
      updatedTermsConditions[i].value = value;
      updatedTermsConditions.forEach((tc, index) => {
        updatedData[`tandc${index + 1}`] = tc.value;
      });

      setTermsConditions(updatedTermsConditions);
    }
    if (name === 'itemAddOn') {
      updatedData[`itemAddOn${i}`] = value;
    }
    if (e.target.name.includes('itemTotalAmount')) {
      let invSubTotalAmount = 0
      for (let index = 0; index < invItems.length; index++) {
        let amountToAdd = e.target.name === `itemTotalAmount${index}` ? e.target.value :
          (data[`itemTotalAmount${index}`] || 0)
        if (invItems[index] === null) {
          invSubTotalAmount += amountToAdd / 1
        }
      }
      setData({ ...data, [e.target.name]: e.target.value, [`invSubTotalAmount0`]: invSubTotalAmount })
      setErrors({ ...error, [e.target.name]: "" })
    }
    if (name.includes('itemQuantity') || name.includes('itemUnitPrice') || name.includes('itemTax%') || name.includes('invSubTotalAmount')) {
      console.log("called sub")
      const index = name.match(/\d+/)[0];
      const quantity = parseFloat(updatedData[`itemQuantity${index}`]) || 0;
      const unitPrice = parseFloat(updatedData[`itemUnitPrice${index}`]) || 0;
      const taxPercentage = parseFloat(updatedData[`itemTax%${index}`]) || 0;

      const taxAmount = quantity * unitPrice * (taxPercentage / 100);
      const totalAmount = (quantity * unitPrice) + taxAmount;

      updatedData[`itemTotalAmount${index}`] = totalAmount.toFixed(2);
      updatedData[`itemTax${index}`] = taxAmount.toFixed(2);

      let invTotalTax = 0;
      let invTotalAmount = 0;
      invItems.forEach((item, idx) => {
        const totalAmt = parseFloat(updatedData[`itemTotalAmount${idx}`]) || 0;
        const taxAmt = parseFloat(updatedData[`itemTax${idx}`]) || 0;
        if (item === null) {
          // invTotalAmountBeforeTax += totalAmt - taxAmt;
          invTotalTax += taxAmt;
          invTotalAmount += totalAmt;
        }
      });
      let invtotalwithextras = invTotalAmount
      for (let index = 0; index < invOther.length; index++) {
        // console.log(invItems.length)
        if (index > 0 && updatedData[`invSubTotalAmount${index}`]) {
          // console.log("invtotalwithextras1", invtotalwithextras)
          invtotalwithextras += parseFloat(updatedData[`invSubTotalAmount${index}`]) || 0
        }
      };
      console.log("invtotalwithextras2", invtotalwithextras)

      updatedData['invTotalAmount'] = invtotalwithextras.toFixed(2)

      updatedData[`invTotalTax`] = invTotalTax.toFixed(2);

      updatedData['invSubTotalAmount0'] = invTotalAmount.toFixed(2);

      updatedData['invTotalAmountBeforeTax'] = (invtotalwithextras - invTotalTax).toFixed(2)

    }
    if (name.includes('invTotalAmount') || name.includes('invAdvToPay')) {
      const totalamt = parseFloat(updatedData['invTotalAmount']) || 0;
      const adv = parseFloat(updatedData['invAdvToPay']) || 0;
      updatedData['invBalanceToPay'] = (totalamt - adv).toFixed(2)


    }



    // Update the state with the new values
    setData(updatedData);
    setErrors({ ...error, [name]: "" });
  }

  useEffect(() => {
    const bootstrap = require('bootstrap');
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl) => {
      return new bootstrap.Tooltip(tooltipTriggerEl, {
        delay: { show: 100, hide: 10 },
        customClass: 'custom-tooltip',
        placement: "bottom",
        trigger: "hover"
      });
    });
  }, []);
  useEffect(() => {
    if (data?.commInvoice?.name) {
      saveCommInvoice()
    }
  }, [data.commInvoice])

  async function saveCommInvoice() {
    setshowLoader(true)
    let formData = new FormData()
    formData.append("userId", userId)
    formData.append("docType", "rq")
    formData.append("docTemplate", "Request Quotation")
    formData.append("docName", `Request Quotation - ${RFQNumber}`)
    if (data.commInvoice) {
      formData.append("doc", data.commInvoice);
    }
    delete data.commInvoice;

    // console.log("@here", JSON.stringify({ data, invItems, invOther }))
    const docData = JSON.stringify({ data, invItems, invOther });
    formData.append('docData', docData);
    if (data.commInvoice) {
      formData.append("doc", data.commInvoice);
    }
    if (selectedInvoiceData?.id) {
      formData.append("updateDocId", selectedInvoiceData.id)
    }
    await call('POST', 'saveEdoc', formData)
    setshowLoader(false)
    toastDisplay("Document downloaded & saved", "success")
  }

  const enableEditingBuyerSupplier = (type) => {
    if (type === "buyer") {
      setEditingBuyer(!editBuyer)

    } else {
      setEditingSeller(!editSeller)
    }
  }
  const enableEditingDiv = (type) => {
    // console.log("t", type)
    if (type === "pos") {
      setEditingPos(!editingPos)

    } else if (type === "remarks") {
      setEditingRemarks(!editingRemarks)
    } else if (type === "tandc") {
      setEditingTandC(!editingTandC)
    } else if (type === "InternalNotes") {
      setEditingInternalNotes(!editingInternalNotes)
    } else if (type === "ClinetNotes") {
      setEditingClinetNotes(!editingClinetNotes)
    }
    else {
      setEditingDeliveryLocation(!editingDeliveryLocation)
    }
  }
  const deleteDiv = (type) => {
    // console.log("delet", type)

    if (type === "pos") {
      setRemovePos(!removePos)

    } else if (type === "remarks") {
      setRemoveRemarks(!removeRemarks)
    } else if (type === "tandc") {
      setRemoveTandC(!removeTandC)
    } else if (type === "InternalNotes") {
      setRemoveInternalNotes(!removeInternalNotes)
    } else if (type === "ClinetNotes") {
      setRemoveClinetNotes(!removeClinetNotes)
    }
    else {
      setRemoveDeliveryLocation(!removeDeliveryLocation)
    }
  }


  const [selectedlist, setselectedlist] = useState([]);
  console.log("supplierIdList", supplierIdList, selectedlist)

  const handleDeleteSupplier = (indexToDelete) => {
    // Remove the supplier from supplierArr based on the index.
    const updatedSupplierArr = supplierArr.filter((_, index) => index !== indexToDelete);
    setSupplierArr(updatedSupplierArr);

    // Get the companyId to delete based on the index
    const companyIdToDelete = supplierArr[indexToDelete]?.companyId;

    // If companyId exists, remove it from supplierIdList
    if (companyIdToDelete) {
      const updatedSupplierIdList = supplierIdList.filter(id => id !== companyIdToDelete);
      setSupplierList(updatedSupplierIdList);
    }

    // Update the `data` object
    setData((prevData) => {
      // Create a new object to hold updated data
      const updatedData = { ...prevData };

      // Remove the specific clientCompanyName, clientContactNo, and clientEmailId keys
      delete updatedData[`clientCompanyName${indexToDelete}`];
      delete updatedData[`clientContactNo${indexToDelete}`];
      delete updatedData[`clientEmailId${indexToDelete}`];

      // Adjust remaining keys by shifting them
      Object.keys(prevData).forEach((key) => {
        if (key.startsWith('clientCompanyName')) {
          const keyIndex = parseInt(key.replace('clientCompanyName', ''), 10);
          if (keyIndex > indexToDelete) {
            updatedData[`clientCompanyName${keyIndex - 1}`] = prevData[key];
            delete updatedData[key];
          }
        } else if (key.startsWith('clientContactNo')) {
          const keyIndex = parseInt(key.replace('clientContactNo', ''), 10);
          if (keyIndex > indexToDelete) {
            updatedData[`clientContactNo${keyIndex - 1}`] = prevData[key];
            delete updatedData[key];
          }
        } else if (key.startsWith('clientEmailId')) {
          const keyIndex = parseInt(key.replace('clientEmailId', ''), 10);
          if (keyIndex > indexToDelete) {
            updatedData[`clientEmailId${keyIndex - 1}`] = prevData[key];
            delete updatedData[key];
          }
        }
      });

      return updatedData;
    });
  };
  const perPage = filter.resultPerPage || 10; // Default 10 rows per page
  const start = (page - 1) * perPage; // Calculate the starting index
  const end = start + perPage; // Calculate the ending index

  // Slice the tableData for the current page
  const paginatedTableData = selectedlist.slice(start, end);
  const [allsuppliers, setAllSuppliers] = useState([])


  useEffect(() => {
    call('POST', "suppliersList", { userId }).then((res) => {
      console.log(res, "res suppliers")
      setselectedlist(res.data)
      setAllSuppliers(res.data)
    })
  }, [])

  console.log(selectedlist, "this is selected list here--->>>>")

  // Assuming supplierArr is your array of selected suppliers
  useEffect(() => {
    console.log("data here", data, supplierIdList)
    if (sellerDetails?.companyName) {
      // Update supplier array and ID list
      const updatedSupplierArr = [...supplierArr, sellerDetails];
      console.log(updatedSupplierArr, "this is updated supplier array--....")
      const updatedSupplierIdList = [...supplierIdList, sellerDetails?.companyId];
      setSupplierArr(updatedSupplierArr);
      setSupplierList(updatedSupplierIdList);

      // Create dynamic keys for company name, contact, and email
      const newClientCompanyKey = `clientCompanyName${updatedSupplierArr.length - 1}`;
      const newClientContactKey = `clientContactNo${updatedSupplierArr.length - 1}`;
      const newClientEmailKey = `clientEmailId${updatedSupplierArr.length - 1}`;

      // Concatenate all supplier contact names
      const allContactNames = updatedSupplierArr.map(supplier => supplier.companyContactNo).join(", ");

      console.log(allContactNames, "this is contact names---->>>>")

      setallcontactName(allContactNames)
      // Update the data state
      setData((prevData) => ({
        ...prevData,

        [newClientCompanyKey]: sellerDetails.companyName,
        [newClientContactKey]: sellerDetails.companyContactNo,
        [newClientEmailKey]: sellerDetails.companyEmailId,

      }));
    }
  }, [sellerDetails, supplierArr, supplierIdList, data]);

  let clientarr
  // Modify the handleCheck function
  const handleCheck = (userId) => {
    const updatedList = selectedlist.map((item) =>
      item.tbl_user_id === userId
        ? { ...item, isChecked: !item.isChecked }
        : item
    );

    setselectedlist(updatedList);

    // Find the selected item based on userId
    const selectedItem = updatedList.find((item) => item.tbl_user_id === userId);

    if (selectedItem.isChecked) {
      const clientarr = data.clientContactName
        ? data.clientContactName.split(",")
        : [];
      clientarr.push(selectedItem.contact_person);

      // Add supplier details
      setData((prevData) => ({
        ...prevData,
        [selectedItem.tbl_user_id]: {
          clientCompanyName: selectedItem.company_name || "-",
          clientAddress: selectedItem.user_address || "-",
          clientContactNo: selectedItem.contact_number || "-",
          clientEmailId: selectedItem.email_id || "-",
          clientContactName: selectedItem.contact_person || "-",
          placeOfSupply: selectedItem.user_address || "-"
        }
      }));

      setSupplierArr([...supplierArr, selectedItem]);
      setSupplierList([...supplierIdList, selectedItem.tbl_user_id]);
      setSelectedSuppliersDetails([...selectedSuppliersDetails, selectedItem]);
    } else {
      // Remove supplier details
      setData((prevData) => {
        const updatedData = { ...prevData };
        delete updatedData[selectedItem.tbl_user_id]; // Remove the key-value pair
        return updatedData;
      });


      setSupplierArr(
        supplierArr.filter((item) => item.tbl_user_id !== userId)
      );

      setSupplierList(
        supplierIdList.filter((id) => id !== userId)
      );

      setSelectedSuppliersDetails((prevDetails) =>
        prevDetails.filter((item) => item.tbl_user_id !== userId)
      );
    }
  };


  const [searchQuery, setSearchQuery] = useState('');
  console.log(clientarr, "this is client rr")

  useEffect(() => {
    if (searchQuery === '') {
      setselectedlist(allsuppliers); // Reset to full list if search query is empty
    } else {
      const filteredSuppliers = allsuppliers.filter(supplier =>
        supplier.company_name.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by company_name
      );
      setselectedlist(filteredSuppliers); // Update the selected list with the filtered suppliers
    }
  }, [searchQuery, allsuppliers]);


  // useEffect(() => {
  //   if (searchQuery === '') {
  //     setselectedlist(allsuppliers); // Reset to full list if search query is empty
  //   } else {
  //     const filteredSuppliers = allsuppliers.filter(supplier =>
  //       supplier.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       supplier.company_address1.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //        supplier.company_address2.toLowerCase().includes(searchQuery.toLowerCase()) || 
  //        supplier.company_city.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by company_address as well
  //     );
  //     setselectedlist(filteredSuppliers); // Update the selected list with the filtered suppliers
  //   }
  // }, [searchQuery, allsuppliers]);


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const [selectedValue, setSelectedValue] = useState("");


  const handleFilterChange = (e) => {
    const selectedStatus = e.target.value;
    let filteredtable = paginatedTableData;
    setSelectedValue(selectedStatus)
    if (selectedStatus) {
      // Convert the selectedStatus and item.status to strings for comparison
      filteredtable = selectedlist.filter(item => item.industry_type === selectedStatus);
      setselectedlist(filteredtable)
    } else {
      setselectedlist(allsuppliers)
    }
  }


  const handleEmailChange = (e) => {
    const selectedStatus = e.target.value;
    let filteredtable = paginatedTableData;
    setSelectedValue(selectedStatus)
    if (selectedStatus) {
      // Convert the selectedStatus and item.status to strings for comparisonSele
      filteredtable = allsuppliers.filter(item => item.email_id === selectedStatus);
      setselectedlist(filteredtable)
    } else {
      setselectedlist(allsuppliers)
    }
  }

  const handleAddressChange = (e) => {
    const selectedStatus = e.target.value;
    let filteredtable = paginatedTableData;
    setSelectedValue(selectedStatus)
    if (selectedStatus) {
      // Convert the selectedStatus and item.status to strings for comparison
      filteredtable = allsuppliers.filter(item => item.user_address === selectedStatus);
      setselectedlist(filteredtable)
    } else {
      setselectedlist(allsuppliers)
    }
  }

  console.log(boolSuppliers, 'bool suppliers--->>>')

  // useEffect(() => {
  //   if ((!boolSuppliers && printbool) || preview.show) {
  //     printDiv("invoiceDiv", `Request Quotation - ${data.docNumber || docNumber}`, [], data, setData, "commInvoice");
  //     saveToDb("new")
  //     handleGoBack()
  //   }
  // }, [boolSuppliers, preview.show]); // Trigger this effect when boolSuppliers or preview.show changes

  const closeAddCommodityPopup = () => setShowAddCommodityPopup(false);



  return (
    <>
      {
        showAddCommodityPopup && <AddNewCommodityPopup onClose={closeAddCommodityPopup} setUpdateStockItems={setUpdateStockItems} userId={userId} userEmail={userEmail} userTypeId={userTypeId} />
      }
      {signdoc && <SignDocument onlyReturnSign={true} setSigndoc={setSigndoc}
        setUpdatedDoc={(signDetails) => {
          console.log("signDetailsssssssssssssssss", signDetails);
          setData({ ...data, invSign: signDetails })
        }} />
      }
      {changeBuyer && <AddNewBuyerPopUp handleCloseModal={() => { setChangeBuyer(false) }} typeOf={"Buyer"} setSelectedCompany={setSelectedBuyer} setAddNewDocument={() => { setChangeBuyer(false) }} />
      }
      {showPopup && <FinanceInvoiceModal limitinvoice={showPopup} setLimitinvoice={togglePopup} closeSuccess={() => togglePopup(false)} >
        <div className="col-md-10 mb-2 ml-5">
          <label className='text-center font-wt-600 text-color1 font-size-14 mb-2'>Upload Company Logo</label>
          <FileInput
            onUploadCancel={() => { setData({ ...data, companyLogo: {} }) }} name={"companyLogo"} value={data["companyLogo"]}
            onChange={(event) => {
              let file_type = event.target.files?.[0]?.["type"]?.toLowerCase()
              if (file_type && (file_type.includes("png") || file_type.includes("jpeg"))) {
                let reader = new FileReader();
                reader.readAsDataURL(event.target.files[0]);
                reader.onloadend = async (e) => {
                  let fileObj = event.target.files[0]
                  let fileDataUrl = e.target.result
                  fileObj["filebase64"] = fileDataUrl
                  setData({ ...data, [event.target.name]: fileObj })
                  togglePopup(false)
                }
              }
              else {
                setErrors({ ...error, companyLogo: 'Only png & jpeg images are supported' })
              }
            }}
            error={error.companyLogo} isEditable={true} />
          {error.companyLogo ? <div class="text-danger mt-2 font-size-12">
            <i class="fa fas fa-exclamation-circle mr-1" aria-hidden="true"></i>
            <b>{error.companyLogo}</b></div> : ''}
        </div>
      </FinanceInvoiceModal>}
      {showLoader && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
      <div className='card mt-1 pt-4' >
        <div className=" row m-0 p-0 justify-content-end"     >
          <div >
            <img onClick={handleGoBack} class="bg-transparent d-block cursor-pointer me-2" src="assets/images/back.png" alt="Back" height="15" width="20"></img>
          </div>

          <div className={`${!preview.show ? ' w-30 ' : ' w-50 '} ${editDocument?.itemStatus === 0 || editDocument?.itemStatus === 2 || editDocument?.itemStatus === 4 ? 'd-none' : 'd-flex'} justify-content-between`} >

            {editDocument?.itemStatus === 3 ?
              <button type="button"
                onClick={() => {
                  // setEditDocument()
                  editDocument.addingOC = true
                  editDocument.itemStatus = 1
                  editDocument.status = 1
                  setSelectedDocument('Order Confirmation')
                }}
                className={` new-btn py-2 px-2 mx-2 text-white`} style={{ width: preview.show ? '200px' : "100%" }}>
                Generate OC
              </button> :
              <>
                {/* <button type="button"
                  onClick={() => {
                    setPreview({ ...preview, show: !preview.show })
                    setBoolSuppliers(false)
                  }}
                  className={` new-btn py-2 px-2 mx-2 text-white`} style={{ width: preview.show ? '300px' : "100%" }}>
                  {!preview.show ? "Preview" : "Back to Editing"}
                </button> */}
                <button type="button"
                  onClick={() => {
                    data.status = 5
                    saveToDb("draft")
                    // handleGoBack()
                  }}
                  className={` new-btn4 py-2 px-2 me-2 text-white`} style={{ width: "300px" }}>
                  Save As Draft
                </button>
                {!boolSuppliers && (<button type="button"
                  onClick={() => {
                    setBoolSuppliers(true)
                    setprintbool(true)
                    // handleGoBack()
                  }}
                  className={` new-btn4 py-2 px-2 me-2 text-white`} style={{ width: "300px" }}>
                  Next
                </button>)}

                {preview.show || boolSuppliers ?
                  <button type="button"
                    onClick={() => {
                      setBoolSuppliers(false)
                      // printDiv("invoiceDiv", `Request Quotation - ${data.docNumber || docNumber}`, [], data, setData, "commInvoice")
                      // printDiv("invoiceDiv", `Request Quotation - ${data.docNumber || docNumber}`, [], data, setData, "commInvoice");
                      // saveToDb("new")
                      // handleGoBack()

                      setTimeout(() => {
                        // printDiv("invoiceDiv", `Request Quotation - ${data.RFQNumber || RFQNumber}`, [], data, setData, "commInvoice");
                        saveToDb("new")
                        // handleGoBack(); // Navigate back after printing
                      }, 300)

                    }}
                    className={`new-btn5 py-2 px-2  text-white `} style={{ width: "300px" }}>
                    {"Save & Send"}
                  </button> : null}
                {/* {preview.show && boolSuppliers ?
                  <button type="button"
                    onClick={() => {
                      printDiv("invoiceDiv", `Request Quotation - ${data.docNumber || docNumber}`, [], data, setData, "commInvoice")
                      saveToDb("new")
                      handleGoBack()
                      // setBoolSuppliers(true)
                    }}
                    className={`new-btn5 py-2 px-2  text-white `} style={{ width: "300px" }}>
                    {"Save & Send"}
                  </button> : null} */}
              </>}
          </div>
        </div>


        {!boolSuppliers && (

          <div id={"invoiceDiv"} className="p-4"   >
            <div style={{ borderRadius: "5px" }} >
              <div
                style={{
                  border: '2px solid #000', borderBottom: '1px solid #000', overflow: "hidden",
                  width: "100%",
                  height: "70px"
                }}
                className="d-flex justify-content-center align-items-center py-2 position-relative" >
                <label className="font-size-18 font-wt-600" >REQUEST FOR SALES QUOTATION</label>
                <div className="position-absolute ms-5 p-1 d-flex justify-content-center align-items-center" style={{ left: 0 }}>
                  <img
                    src={data.companyLogo ? URL.createObjectURL(data.companyLogo) : "assets/images/sidebarV2/lc_menu.svg"}
                    alt="Company Logo"

                    style={{
                      maxWidth: "100px",
                      minWidth: "50px",
                      objectFit: "contain"
                    }}
                  />

                  <div style={{ display: preview.show ? "none" : "block", }}>
                    <button
                      onClick={() => {
                        // console.log("111111.Edit icon clicked, triggering file input click.", fileInputRef);

                        if (fileInputRef.current) {
                          // console.log("Edit icon clicked, triggering file input click.");
                          fileInputRef.current.click();
                        }
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        marginLeft: "0.5rem"
                      }}
                    >
                      <img
                        className="p-1 mt-1 me-1 border border-secondary rounded"
                        style={{ backgroundColor: !editBuyer ? "#c7d5d6" : "" }}
                        src="assets/images/edit.png"
                        alt="Edit Logo"
                      />
                    </button>
                  </div>

                  {/* (
                  <>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setData(prev => ({ ...prev, companyLogo: e.target.files[0] }));
                        }
                      }}
                    />

                  </> */}


                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>


              </div>
              <div className="row m-0 d-flex " >
                <div className="col-8 p-0" style={{ borderLeft: "2px solid black" }}>

                  <div className="p-3  d-flex justify-content-between"
                    style={{ border: '1px solid #000', borderLeft: '0px solid #000' }}>
                    <div className="ps-2 w-50 me-2 border border-secondary rounded position-relative" style={{ backgroundColor: !editBuyer ? "#ebf7f4" : "" }}>
                      <div className=" position-relative w-100 mb-2 mt-2 " >
                        <div className="d-flex justify-content-start align-items-center mb-1">
                          <label className="font-size-15 font-wt-500 m-0" ><u>BUYER DETAILS</u></label>
                          {!preview.show && <img
                            className="cursor p-1  ms-2 mb-1 border border-secondary rounded"
                            src="assets/images/sidebarV2/buyermanagement.svg"
                            onClick={() => { setChangeBuyer(true) }}
                            data-toggle="tooltip"
                            title="Change Buyer"
                          />}
                        </div>
                        <InputForTable
                          fontClass={" font-size-15 font-wt-500 "}
                          isDisabled={preview.show || editBuyer} placeholder={(!data.companyName && !preview.show) ? "<COMPANY NAME>" : ""} name={"companyName"} value={data.companyName} onChange={handleChange} />

                      </div>
                      <div className="position-relative w-70 mb-2" >
                        <NewTextAreaForTable isDisabled={preview.show || editBuyer} placeholder={(!data.originAddress && !preview.show) ? "Enter Address" : ""} name={"originAddress"} value={data.originAddress} onChange={handleChange} />
                      </div>
                      <div className="position-relative w-70 mb-2" >
                        <InputForTable isDisabled={preview.show || editBuyer} placeholder={(!data.companyWebsite && !preview.show) ? "Enter Website" : ""} name={"companyWebsite"} value={data.companyWebsite} onChange={handleChange} />
                      </div>
                      <div className="position-relative w-70 mb-2" >
                        <InputForTable isDisabled={preview.show || editBuyer} placeholder={(!data.companyEmailId && !preview.show) ? "Enter Email Id" : ""} name={"companyEmailId"} value={data.companyEmailId} onChange={handleChange} />
                      </div>
                      <div className="position-relative w-70 mb-2" >
                        <InputForTable isDisabled={preview.show || editBuyer} placeholder={(!data.companyContactNo && !preview.show) ? "Enter Contact Number" : ""} name={"companyContactNo"} value={data.companyContactNo} onChange={handleChange} />
                      </div>
                      <div className="position-absolute w-20" style={{ top: 2, right: 2, display: preview.show ? "none" : "block" }}>
                        <div className="d-flex justify-content-end">
                          <img className="cursor p-1 mt-1 me-1 border border-secondary rounded" style={{ backgroundColor: !editBuyer ? "#c7d5d6" : "" }} src="assets/images/edit.png" onClick={() => enableEditingBuyerSupplier("buyer")} />
                          {/* <img className="cursor p-1 mt-1 me-1 border border-secondary rounded" src="assets/images/sidebarV2/buyermanagement.svg" data-toggle="tooltip" onClick={() => { setChangeBuyer(true) }} /> */}

                        </div>
                      </div>
                    </div>
                    <div className={`w-50 ps-2 pt-1 position-relative ${!removeDeliveryLocation ? 'border border-secondary rounded' : ''}`} style={{ backgroundColor: !editingDeliveryLocation ? "#ebf7f4" : "" }}>
                      {!removeDeliveryLocation &&
                        <div className="p-"
                        >
                          <label className="font-size-15 font-wt-500" ><u>DELIVERY LOCATION</u></label>
                          <div className="position-relative w-70 mb-2 mt-2" >
                            <InputForTable
                              isDisabled={preview.show || editingDeliveryLocation} placeholder={(!data.shipToContactName && !preview.show) ? "Enter Contact Name" : ""} name={"shipToContactName"} value={data.shipToContactName} onChange={handleChange} />
                          </div>
                          <div className="position-relative w-70 mb-2" >
                            <InputForTable isDisabled={preview.show || editingDeliveryLocation} placeholder={(!data.shipToCompanyName && !preview.show) ? "Enter Company Name" : ""} name={"shipToCompanyName"} value={data.shipToCompanyName} onChange={handleChange} />
                          </div>
                          {/* <div className="position-relative w-70 mb-2" >
                          <InputForTable isDisabled={preview.show || editingDeliveryLocation} placeholder={(!data.shipToEmailId && !preview.show) ? "Enter Email Id" : ""} name={"shipToEmailId"} value={data.shipToEmailId} onChange={handleChange} />
                        </div> */}
                          <div className="position-relative w-70 mb-2" >
                            <InputForTable isDisabled={preview.show || editingDeliveryLocation} placeholder={(!data.shipToContactNo && !preview.show) ? "Enter Contact Number" : ""} name={"shipToContactNo"} value={data.shipToContactNo} onChange={handleChange} />
                          </div>
                          <div className="position-relative w-70 mb-2" >
                            <NewTextAreaForTable isDisabled={preview.show || editingDeliveryLocation} placeholder={(!data.finalDestination && !preview.show) ? "Enter Address" : ""} name={"finalDestination"} value={data.finalDestination} onChange={handleChange} />
                          </div>
                          <div className="position-absolute w-20" style={{ top: 2, right: 2, display: preview.show ? "none" : "block" }}>
                            <div className="d-flex justify-content-end">
                              <img className="cursor p-1 mt-1 me-1 border border-secondary rounded" style={{ backgroundColor: !editingDeliveryLocation ? "#c7d5d6" : "" }} src="assets/images/edit.png" onClick={() => enableEditingDiv("location")} />
                              <img className="cursor p-1 mt-1 me-1 border border-secondary rounded" src="assets/images/delete.png" onClick={() => deleteDiv("location")} />
                            </div>
                          </div>
                        </div>}
                    </div>
                  </div>

                </div>
                <div className="col-4 p-0 m-0">
                  <div style={{ borderRight: '1.5px solid #000', borderBottom: '1px solid #000' }} className="d-flex flex-wrap" >
                    <div className="w-50 p-0" >
                      <div className="p-3"
                        style={{ border: '1px solid #000' }}>
                        <label className="font-size-15 font-wt-500" ><u>RFQ NO.</u></label>
                        <div className="position-relative" >
                          <InputForTable isDisabled={preview.show} placeholder={(!data.RFQNumber && !preview.show) ? "Enter No" : ""} name={"RFQNumber"} value={RFQNumber} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                    <div className="w-50 p-0" >
                      <div className="p-3"
                        style={{ border: '1px solid #000' }}>
                        <label className="font-size-15 font-wt-500" ><u>RFQ DATE</u></label>
                        <div className="position-relative" >
                          <InputForTable isDisabled={preview.show} type={"date"} placeholder={(!data.RFQDate && !preview.show) ? "Select Date" : ""} name={"RFQDate"} value={data.RFQDate} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                    <div className="w-50 p-0" >
                      <div className="p-3"
                        style={{ border: '1px solid #000' }}>
                        <label className="font-size-15 font-wt-500" ><u>BIDDING START DATE</u></label>
                        <div className="position-relative" >
                          <InputForTable isDisabled={preview.show} type={"date"} placeholder={(!data.biddingStartDate && !preview.show) ? "Select Date" : ""} name={"biddingStartDate"} value={data.biddingStartDate} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                    <div className="w-50 p-0" >
                      <div className="p-3"
                        style={{ border: '1px solid #000' }}>
                        <label className="font-size-15 font-wt-500" ><u>BIDDING END DATE</u></label>
                        <div className="position-relative" >
                          <InputForTable isDisabled={preview.show} type={"date"} placeholder={(!data.biddingEndDate && !preview.show) ? "Select Date" : ""} name={"biddingEndDate"} value={data.biddingEndDate} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                    <div className="w-50 p-0" >
                      <div className="p-3"
                        style={{ border: '1px solid #000' }}>
                        <label className="font-size-15 font-wt-500" ><u>DELIVERY DATE</u></label>
                        <div className="position-relative" >
                          <InputForTable isDisabled={preview.show} type={"date"} placeholder={(!data.deliveryDate && !preview.show) ? "Select Date" : ""} name={"deliveryDate"} value={data.deliveryDate} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                    <div className="w-50 p-0" >
                      <div className="p-3"
                        style={{ border: '1px solid #000' }}>
                        <label className="font-size-15 font-wt-500" ><u>PAYMENT TERM</u></label>
                        <div className="position-relative" >
                          <InputForTable isDisabled={preview.show} type={"text"} placeholder={(!data.paymentTerm && !preview.show) ? "Enter Payment Term" : ""} name={"paymentTerm"} value={data.paymentTerm} onChange={handleChange} />
                        </div>
                      </div>
                    </div>
                    {/* <div className="w-100 p-0" >
                    <div className="p-3"
                      style={{ border: '1px solid #000' }}>
                      <label className="font-size-15 font-wt-500" ><u>KIND ATTENTION</u></label>
                      <div className="position-relative" >
                        <InputForTable isDisabled={preview.show} type={"text"} placeholder={(!data.attention && !preview.show) ? "Enter..." : ""} name={"attention"} value={data.attention} onChange={handleChange} />
                      </div>
                    </div>
                  </div> */}
                  </div>
                </div>

              </div>

              {/* 
            <div className=" m-0 d-flex " style={{ borderRight: "2px solid black", borderBottom: "0px" }} >
              <div className="col-8 p-0" >
                <div className="p-3 "
                  style={{ border: '1px solid #000', borderLeft: '2px solid #000', borderBottom: '0px solid #000' }}>
                  <div className=" me-2 pt-1 ps-2 border border-secondary rounded position-relative" style={{ backgroundColor: !editSeller ? "#ebf7f4" : "" }}>
                    <label className="font-size-15 font-wt-500" ><u>SUPPLIER DETAILS</u></label>
                    {supplierArr.length > 0 && (
                      <div className="position-relative w-70 mb-2 mt-2">
                        {supplierArr.map((supplier, index) => (
                          <div key={index} className="mb-2">

                            <div className="d-flex align-items-center">

                              <div style={{ border: '1px solid #000', padding: '10px', borderRadius: '5px', flexGrow: 1 }}>
                                <InputForTable
                                  isDisabled={preview.show || editSeller}
                                  placeholder={(!data[`clientCompanyName${index}`] && !preview.show) ? `Enter Contact Name ${index + 1}` : ""}
                                  name={`clientCompanyName${index}`}
                                  value={data[`clientCompanyName${index}`]}
                                  onChange={handleChange}
                                  style={{ width: '100%' }}
                                />
                              </div>


                              <div className="ms-2 mt-8">
                                <img
                                  className="cursor-pointer"
                                  src="assets/images/delete.png"
                                  alt="Delete"

                                  onClick={() => handleDeleteSupplier(index)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}


                  </div>
                  <button className="btn btn-primary" onClick={() => { setChangeBuyer(true) }} style={{ width: "140px", marginTop: "1rem" }}>Add Suppliers</button>


                </div>
              </div>

            </div> */}

              <div className="p-3"
                style={{ border: '2px solid #000' }}>
                <NewTablev2 addTableClass={`m-0 invBorder`}
                  columns={preview.show ? invItemsTable : invItemsTable.concat([{ subColumns: "ACTION", subColumnStyle: { width: '5%' } }])}
                >
                  {invItems.map((i, j) => {
                    if (i === null) {
                      jj = jj + 1
                      if (preview.show && !data[`itemDesc${j}`]) {
                        return null
                      }
                      return (
                        <tr>
                          <td><label className="font-size-16 font-wt-500" >{jj + 1}</label></td>
                          <td>

                            <div className="position-relative w-100">
                              <DropdownSearch placeholder={"Select Commodity*"} isDisabled={preview.show} defaultItem={editDocument && data[`itemDesc${j}`]} items={[
                                "Add New Commodity",
                                ...mstCommList.map((item) => item.commodity_pretty_name),

                              ]} onSelect={handleCommodityChange} customStyles={{ "index": j }} />                              <div className="mt-3 mb-2 ms-2">
                                <InputForTable isDisabled={preview.show} type={"text"} placeholder={(!data[`itemAddOn${j}`] && !preview.show) ? "Enter Item Description" : ""} name={"itemAddOn"} value={data[`itemAddOn${j}`]} onChange={(e) => handleChange(e, j)} />
                              </div>

                              {/*{inputValue && filteredOptions.length > 0 && (
                              <select
                                className="w-100"
                                value={inputValue}
                                onChange={(e) => {
                                  setInputValue(e.target.value);
                                  handleCommodityChange(e.target.value, j);
                                }}
                              >
                                <option value="" disabled>Select Commodity</option>
                                {filteredOptions.map((comm, i) => (
                                  <option key={i} value={comm.commodity_pretty_name}>
                                    {comm.commodity_pretty_name}
                                  </option>
                                ))}
                              </select>
                            )}*/}
                            </div>
                          </td>
                          <td>
                            <div className="position-relative " >
                              <InputForTable isDisabled={preview.show}
                                placeholder={(!data[`itemHSN${j}`] && !preview.show) ? "Enter HSN" : ""} name={`itemHSN${j}`} value={data[`itemHSN${j}`]} onChange={handleChange} />


                            </div>
                          </td>
                          <td>
                            <div className="position-relative d-flex " style={{ gap: "5px" }} >

                              <InputForTable isDisabled={preview.show}
                                placeholder={(!data[`itemQuantity${j}`] && !preview.show) ? "Quantity" : ""} name={`itemQuantity${j}`} value={data[`itemQuantity${j}`]} onChange={handleChange} />
                              <InputForTable isDisabled={preview.show}
                                placeholder={(!data[`itemQuantityUnits${j}`] && !preview.show) ? "Units" : ""} name={`itemQuantityUnits${j}`} value={data[`itemQuantityUnits${j}`]} onChange={handleChange} />

                            </div>
                          </td>




                          {!preview.show ?
                            <td>
                              <div className="d-flex w-100 justify-content-between" >
                                <div className="" >
                                  {(invItems.length - invItems.filter(i => {
                                    if (i === undefined) {
                                      return true
                                    }
                                  }).length) - 1 === jj ?
                                    <img
                                      onClick={async () => {
                                        let temp = invItems
                                        temp.push(null)
                                        setInvItems([...temp])
                                      }}
                                      className="cursor" src="assets/images/add_black_icon.png" /> :
                                    <img
                                      onClick={() => {
                                        let temp = invItems
                                        temp[j] = undefined
                                        setInvItems([...temp])
                                      }}
                                      className="cursor" src="assets/images/delete.png" />}
                                </div>
                              </div>
                            </td> : null}
                        </tr>
                      )
                    }
                  })}
                </NewTablev2>




              </div>
              {!removeTandC && <div className='p-3 mt-2 position-relative' style={{ border: '2px solid #000' }}>
                <label className="font-size-15 font-wt-500" ><u>TERMS AND CONDITIONS</u></label>

                {termsConditions.map((tc, index) => (
                  <div className="position-relative w-100 mb-2 mt-2" key={tc.id}>
                    <InputForTable
                      isDisabled={preview.show || editingTandC}
                      placeholder={(!tc.value && !preview.show) ? "Enter Terms and Conditions" : ""}
                      name={"tandc"}
                      value={tc.value}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </div>
                ))}

                {!preview.show && <button type="button" disabled={editingTandC} className="btn border" onClick={addNewTermCondition}>+ Add More</button>}
                <div className="position-absolute w-20" style={{ top: 2, right: 2, display: preview.show ? "none" : "block" }}>
                  <div className="d-flex justify-content-end">
                    <img className="cursor p-1 mt-1 me-1 border border-secondary rounded" style={{ backgroundColor: !editingDeliveryLocation ? "#c7d5d6" : "" }} src="assets/images/edit.png" onClick={() => enableEditingDiv("tandc")} />
                    <img className="cursor p-1 mt-1 me-1 border border-secondary rounded" src="assets/images/delete.png" onClick={() => deleteDiv("tandc")} />
                  </div>
                </div>
              </div>}
              {!removeRemarks && <div className="w-100 p-0 mt-2 position-relative" style={{ border: '1.7px solid #000' }}>
                <div className="p-3"
                  style={{ border: '1px solid #000' }}>
                  <label className="font-size-15 font-wt-500" ><u>REMARKS</u></label>
                  <div className="position-relative" >
                    <InputForTable isDisabled={preview.show || editingRemarks} type={"text"} placeholder={(!data.remarks && !preview.show) ? "Enter Remarks" : ""} name={"remarks"} value={data.remarks} onChange={handleChange} />
                  </div>
                </div>
                <div className="position-absolute w-20" style={{ top: 2, right: 2, display: preview.show ? "none" : "block" }}>
                  <div className="d-flex justify-content-end">
                    <img className="cursor p-1 mt-1 me-1 border border-secondary rounded" style={{ backgroundColor: !editingRemarks ? "#c7d5d6" : "" }} src="assets/images/edit.png" onClick={() => enableEditingDiv("remarks")} />
                    <img className="cursor p-1 mt-1 me-1 border border-secondary rounded" src="assets/images/delete.png" onClick={() => deleteDiv("remarks")} />
                  </div>
                </div>
              </div>}
              {!removeClinetNotes && <div className="w-100 p-0 mt-2 position-relative" style={{ border: '1.7px solid #000' }}>
                <div className="p-3"
                  style={{ border: '1px solid #000' }}>
                  <label className="font-size-15 font-wt-500" ><u>CLIENT NOTES</u></label>
                  <div className="position-relative" >
                    <InputForTable isDisabled={preview.show || editingClinetNotes} type={"text"} placeholder={(!data.clinetNotes && !preview.show) ? "Enter Clinet Notes" : ""} name={"clinetNotes"} value={data.clinetNotes} onChange={handleChange} />
                  </div>
                </div>
                <div className="position-absolute w-20" style={{ top: 2, right: 2, display: preview.show ? "none" : "block" }}>
                  <div className="d-flex justify-content-end">
                    <img className="cursor p-1 mt-1 me-1 border border-secondary rounded" style={{ backgroundColor: !editingClinetNotes ? "#c7d5d6" : "" }} src="assets/images/edit.png" onClick={() => enableEditingDiv("ClinetNotes")} />
                    <img className="cursor p-1 mt-1 me-1 border border-secondary rounded" src="assets/images/delete.png" onClick={() => deleteDiv("ClinetNotes")} />
                  </div>
                </div>
              </div>}
              {!removeInternalNotes && <div className="w-100 p-0 mt-2 position-relative" style={{ border: '1.7px solid #000' }}>
                <div className="p-3"
                  style={{ border: '1px solid #000' }}>
                  <label className="font-size-15 font-wt-500" ><u>INTERNAL NOTES</u></label>
                  <div className="position-relative" >
                    <InputForTable isDisabled={preview.show || editingInternalNotes} type={"text"} placeholder={(!data.internalNotes && !preview.show) ? "Enter Internal Notes" : ""} name={"internalNotes"} value={data.internalNotes} onChange={handleChange} />
                  </div>
                </div>
                <div className="position-absolute w-20" style={{ top: 2, right: 2, display: preview.show ? "none" : "block" }}>
                  <div className="d-flex justify-content-end">
                    <img className="cursor p-1 mt-1 me-1 border border-secondary rounded" style={{ backgroundColor: !editingInternalNotes ? "#c7d5d6" : "" }} src="assets/images/edit.png" onClick={() => enableEditingDiv("InternalNotes")} />
                    <img className="cursor p-1 mt-1 me-1 border border-secondary rounded" src="assets/images/delete.png" onClick={() => deleteDiv("InternalNotes")} />
                  </div>
                </div>
              </div>}

              <div className="px-3 py-5 mt-2"
                style={{ border: '2px solid #000' }}>
                <div className="d-flex m-0 p-0 align-items-center" >
                  <label className="font-size-14 font-wt-500 w-45" >"WE HEREBY CERTIFY THIS INVOICE TO BE TRUE AND CORRECT."</label>
                  <div className="w-55  d-flex" >
                    <div className="position-relative w-50" >
                      <label className="font-size-14 font-wt-500" ><u>Name of Authorized Signatory</u></label>
                      <InputForTable isDisabled={preview.show}
                        placeholder={(!data.authorizedSignatoryName && !preview.show) ? "Enter Name" : ""} name={"authorizedSignatoryName"} value={data.authorizedSignatoryName} onChange={handleChange} />
                    </div>
                    <div className="position-relative w-50" >
                      <label
                        onClick={() => {
                          setSigndoc(true);
                        }}
                        className="font-size-14 font-wt-500 cursor" ><u>Signature</u>
                        {preview.show ? null :
                          <img src="assets/images/edit.png" className="cursor" />}</label>
                      <div>
                        {data?.invSign?.typedSign ?
                          <label style={{
                            fontFamily: signFonts.find((i, j) => {
                              if (j === data.invSign.typedSignStyle) {
                                return true
                              }
                            })['font']
                          }} className="font-size-16" >{data.invSign.typedSign}</label>
                          : data?.invSign?.signBase64 ?
                            <img src={data?.invSign?.signBase64} />
                            : null}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <div className="mt-3 border-secondary border-top pt-3" style={{
              display: preview.show ? "none" : "block"
            }}>
              <h6>ADD ON'S:</h6>
              <div className=" d-flex justify-content-start ">
                {removeDeliveryLocation && <button className="me-2 btn border border-secondary rounded" onClick={() => { setRemoveDeliveryLocation(false) }} style={{ backgroundColor: !removeDeliveryLocation ? "#5CB8D3" : "" }}>Add Delivery Location</button>}
                {removePos && <button className="me-2 btn  border border-secondary rounded" onClick={() => { setRemovePos(false) }} style={{ backgroundColor: !removePos ? "#5CB8D3" : "" }}>Add Supplier Location</button>}
                {removeRemarks && <button className="me-2 btn  border border-secondary rounded" onClick={() => { setRemoveRemarks(false) }} style={{ backgroundColor: !removeRemarks ? "#5CB8D3" : "" }}>Add Remarks</button>}
                {removeTandC && <button className="me-2 btn  border border-secondary rounded" onClick={() => { setRemoveTandC(false) }} style={{ backgroundColor: !removeTandC ? "#5CB8D3" : "" }}>Add Terms and Conditions</button>}
                {removeInternalNotes && <button className="me-2 btn  border border-secondary rounded" onClick={() => { setRemoveInternalNotes(false) }} style={{ backgroundColor: !removeInternalNotes ? "#5CB8D3" : "" }}>Add Internal Notes</button>}
                {removeClinetNotes && <button className="me-2 btn  border border-secondary rounded" onClick={() => { setRemoveClinetNotes(false) }} style={{ backgroundColor: !removeClinetNotes ? "#5CB8D3" : "" }}>Add Clinet Notes</button>}

              </div>

            </div>
          </div>
        )}

        {boolSuppliers && (
          <div className="table-wrapper" style={{ margin: "2rem" }}>

            <div style={{ marginLeft: "35%", color: "#7da67d", fontSize: "18px" }}>Select Suppliers to Send Request Quotation</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

              <FilterGlobal
                filterData={filterData}
                setFilterData={setFilterData}
                showFilterBtn={true}
                showResultPerPage={true}
                count={allsuppliers.length}
                filter={filter}
                setFilter={setFilter}
                refresh={refresh}
                setRefresh={setrefresh}
                isAdditionalButton
                userTokenDetails={userTokenDetails}
                tablecol={tablecol}
                paginatedTableData={paginatedTableData}
                selectedlist={selectedlist}
                setselectedlist={setselectedlist}
                handleFilterChange={handleFilterChange}
                handleEmailChange={handleEmailChange}
                selectedValue={selectedValue}
                allsuppliers={allsuppliers}
                handleAddressChange={handleAddressChange}
              />
              <input
                type="text"
                className="form-control mb-4"
                placeholder="Search Company or Address"
                value={searchQuery}
                onChange={handleSearch}
                style={{ width: "28rem", }}
              />



            </div>


            <NewTablev2 columns={tablecol}>
              {Array.isArray(selectedlist) && selectedlist.length > 0 ? (
                paginatedTableData.map((item) => (
                  <tr key={item.tbl_user_id}>
                    <td>
                      <img
                        onClick={() => handleCheck(item.tbl_user_id)}
                        className="cursor ml-8"
                        src={`assets/images/${item.isChecked ? "checked-green" : "empty-check"}.png`}
                        style={{
                          backgroundColor: "white",
                          cursor: "pointer",
                        }}
                        alt="checkbox"
                      />
                    </td>
                    <td>
                      <label className="font-size-13 font-wt-400 text-break">
                        {item.company_name || "-"}
                      </label>
                    </td>
                    <td>
                      <label className="font-size-13 font-wt-500 text-break text-color1">
                        {item.contact_number || "-"}
                      </label>
                    </td>
                    <td>
                      <label className="font-size-13 font-wt-500 text-break text-color1">
                        {item.user_address || "-"}
                      </label>
                    </td>
                    <td>
                      <label className="font-size-13 font-wt-500 text-break text-color1">
                        {item.industry_type || "-"}
                      </label>
                    </td>
                    <td>
                      <label className="font-size-13 font-wt-500 text-break text-color1">
                        {item.contact_person || "-"}
                      </label>
                    </td>
                    <td>
                      <label className="font-size-13 font-wt-500 text-break text-color1">
                        {item.email_id || "-"}
                      </label>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={tablecol.length}>No suppliers found.</td>
                </tr>
              )}

            </NewTablev2>
            <Pagination page={page} totalCount={selectedlist.length} onPageChange={(p) => setPage(p)} refresh={refresh} setRefresh={setrefresh} perPage={filter.resultPerPage || 0} />
          </div>
        )}


      </div>

    </>
  )

}


const mapStateToProps = state => {
  return {
    navToggleState: state.navToggleState
  }
}

export default connect(
  mapStateToProps,
  null
)(RequestForQuotation)

