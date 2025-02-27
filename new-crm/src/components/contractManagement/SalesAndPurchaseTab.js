import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import { connect, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import call from '../../service';
import { FileInput } from '../../utils/FileInput';
import avatarUrl from '../../utils/makeAvatarUrl';
import MultipleSelect from '../../utils/MultipleSelect';
import { astrix, ClearCache, convertImageToPdf, dataURItoBlob, GetCache, getDocDetails, most_used_currencies, multiSelectEventHandler, SetCache, toolTip } from '../../utils/myFunctions';
import { InputWithSelect, NewInput, NewSelect } from '../../utils/newInput';
import { NewTable } from '../../utils/newTable';
import { StarRating } from '../../utils/starRating';
import toastDisplay from '../../utils/toastNotification';
import Header from '../partial/header';
import HeaderV2 from '../partial/headerV2';
import Sidebar, { inspectionTypeIds, traderTypeIds } from '../partial/sidebar';
import SideBarV2 from '../partial/sideBarV2';
import { PopupMessage } from '../popupMessage';
import config from '../../config.json';
import moment from 'moment';
import TutorialPopup, { TutorialVideoPopup } from '../tutorialPopup';
import ChatBoxPopUp2 from '../chatRoom/components/ChatBoxPopUp2';
import { setContractDetails, setContractState, setContractDocList, setproductDetails } from '../../store/actions/action';

import TransactionDetails from './transactionView'
import { getSocket } from '../../socket'
import NewTablev2 from '../../utils/newTablev2';
import { formatDate_Application } from '../../utils/dateFormaters';
import { getStatusDisplayName } from '../dataTablesColumsMap/contractListColoums';
import { Action } from '../myCounterPartComp/action';
import Filter from '../InvoiceDiscounting/components/Filter';
import Pagination from '../InvoiceDiscounting/contract/components/pagination';
import FinanceInvoiceModal from '../InvoiceDiscounting/contract/components/financeinvoiceModal';
import { useLocation } from "react-router-dom";

import BuyerModal from "./addnewBuyerPopUp";
import AddNewBuyerPopUp from "./addnewBuyerPopUp";
import DropdownSearch from "../tallyReports/Cards/dropdownWithSearch";
import SalesQuotaion from "./salesQuotaion";
import PurchaseOrder from "./po";
import AddDocument from './AddDocument';
import DatePicker from 'react-datepicker';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import 'react-datepicker/dist/react-datepicker.css';
import FilterNew from '../InvoiceDiscounting/components/FilterNew';
import TransactionTimeline from './transactionTimeline';
import { HandleRedirect } from '../handleRedirects';

let statsType = [
  { name: 'Purchase Order', color: '#FFAC1C' },
  { name: 'Sales Quotation', color: '#1B94B7' },
  { name: 'Order Confirmation', color: '#E74C3C' },
  { name: 'Sales Enquiry', color: '#48DA87' },
  { name: 'Purchase Tax Invoice', color: '#48DA87' },
]

const SalesAndPurchaseTab = ({ userTokenDetails, setHideButtons, cDetailsState, setContractDetails, contractState, setContractState, clientType, setContractDocList, navToggleState, dispatch, tab }) => {
  const history = useHistory();
  console.log("tokennnnnnnn", userTokenDetails)
  const location = useLocation();
  const queryParams = new URLSearchParams(window.location.search)
  const [selectedDocType, setSelectedDocType] = useState('');
  const [contractCount, setcontractCount] = useState({})
  const [refresh, setrefresh] = useState(0)
  const [searchKey, setsearchKey] = useState("")
  const [filterData, setFilterData] = useState({})
  const [statusFilter, setstatusFilter] = useState(0)
  const [contractLog, setcontractLog] = useState({ modal: false, contract_no: "" })
  const [showQuotRaiseModal, setshowQuotRaiseModal] = useState({})
  const [showInvestigationRemark, setshowInvestigationRemark] = useState({})
  const [showInsuranceRemark, setshowInsuranceRemark] = useState({});
  const [showLoader, setshowLoader] = useState(false);
  const [quotaAvail, setQuotaAvail] = useState(false)
  const [userPlanQuota, setUserPlanQuota] = useState({});
  const [deleteConfirm, setdeleteConfirm] = useState(false);
  const [contDeleteData, setcontDeleteData] = useState({});
  const [inspectionContractModal, setInspectionContractModal] = useState({ show: false, data: {} })
  const [inspectionWorkorderDetails, setInspectionWorkorderDetails] = useState({ show: false, data: {}, offer_data: {} })
  const [cameForEditingChangelogs, setCameForEditingChangelogs] = useState(false)
  const [tableData, settableData] = useState([]);


  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [action, setAction] = useState({ show: false, index: null })
  const [statusAction, setStatusAction] = useState({ show: false, index: null })
  const [filter, setFilter] = useState({ resultPerPage: 10, search: queryParams.get("search") || "" })
  const [page, setPage] = useState(1)
  const [transactionPopup, toggleTransactionPopup] = useState({ show: false, data: [] })
  const [userPermissions, setUserPermissions] = useState(null);
  // PO and SQ
  const dropdownItems = ["Request Quotation", "Sales Enquiry", "Sales Quotation", "Order Confirmation", "Purchase Order", "Invoice", "Purchase Tax Invoice", 'Delivery Challan', "Inward Document", "Goods Received Note", "Credit Note", "Debit Note"]
  const [isQuotaionModalOpen, setQuotationIsModalOpen] = useState(false);
  const [isPOModalOpen, setPOIsModalOpen] = useState(false);
  // const [isOCModalOpen, setIsOCModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState('')
  const [addNewDocument, setAddNewDocument] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [addingNewDocument, setAddingNewDocument] = useState(false)
  const [editDocument, setEditDocument] = useState({})
  const [selectedBuyer, setSelectedBuyer] = useState("")
  const [selectedSeller, setSelectedSeller] = useState("")
  const [activeButton, setActiveButton] = useState('sales');
  const [alltableData, setAllTableData] = useState([]);
  const [changeLogsOfSQ, setChangeLogsOfSQ] = useState([])
  const [salesTableData, setSalesTableData] = useState([]);
  const [purchaseTableData, setPurchaseTableData] = useState([]);
  const [statusTiles, setstatusTiles] = useState(statsType)
  const [dropDownType, setdropDownType] = useState(dropdownItems)
  const docTypeColors = {
    "Request Quotation": { base: "#FFAC1C", lighter: "#FFD580", darker: "#E69500", muted: "#FFC766" }, // Orange Family
    "Sales Enquiry": { base: "#48DA87", lighter: "#7FE1A6", darker: "#34A56A", muted: "#A0E6C0" }, // Green Family
    "Sales Quotation": { base: "#1B94B7", lighter: "#66C2DD", darker: "#157A92", muted: "#89CDE4" }, // Teal/Blue Family
    "Order Confirmation": { base: "#E74C3C", lighter: "#FF8275", darker: "#C44133", muted: "#F28B82" }, // Red Family
    "Purchase Order": { base: "#FFAC1C", lighter: "#FFD580", darker: "#E69500", muted: "#FFC766" }, // Orange Family
    "Invoice": { base: "#7D3C98", lighter: "#A569BD", darker: "#5B2C6F", muted: "#B39FDB" }, // Purple Family
    "Purchase Tax Invoice": { base: "#48DA87", lighter: "#99EABF", darker: "#2E8B57", muted: "#B3F2D4" }, // Green Family
    "Delivery Challan": { base: "#2E86C1", lighter: "#5DADE2", darker: "#1B4F72", muted: "#85C1E9" }, // Blue Family
    "Inward Document": { base: "#D68910", lighter: "#F4D03F", darker: "#A04000", muted: "#F5B041" }, // Yellow/Brown Family
    "Goods Received Note": { base: "#27AE60", lighter: "#52BE80", darker: "#1D8348", muted: "#82E0AA" }, // Green Family
    "Credit Note": { base: "#C0392B", lighter: "#E74C3C", darker: "#922B21", muted: "#F1948A" }, // Dark Red Family
    "Debit Note": { base: "#2874A6", lighter: "#5499C7", darker: "#1B4F72", muted: "#85C1E9" }, // Dark Blue Family
  };

  // const handleButtonClick = (buttonType) => {
  //   setActiveButton(buttonType);
  //   if (buttonType === "sales") {
  //     settableData(salesTableData)
  //   } else {
  //     settableData(purchaseTableData)
  //   }
  // };
  const handleCloseModal = () => {
    setQuotationIsModalOpen(false);
    setPOIsModalOpen(false)
    // setIsOCModalOpen(false)
    setHideButtons(true)

  };
  const handleStatusChange = async (statusNum, data) => {
    console.log(statusNum, data)
    setLoading(true)
    await call('POST', 'updateSalesPurchaseQuotation', {
      status: statusNum,
      sellerId: data.sellerId, buyerId: data.buyerId,
      data: { ...data.details, tags: data.details?.tags },
      appId: data.id,
      docType: data.docType,
      docId: data.docId,
      transaction_timeline: data.transaction_timeline
    })
    setrefresh(prev => prev + 1)
    setLoading(false)
  }

  useEffect(() => {
    // Check for the 'edit' query parameter
    const params = new URLSearchParams(location.search);
    const isEditMode = params.get("edit") === "true";

    if (isEditMode) {
      const storedData = localStorage.getItem("editdocumentdetails");
      if (storedData) {
        setEditDocument(JSON.parse(storedData));
        setShowTransactionDetails(true)
        setHideButtons(true)
      }
    }
    localStorage.removeItem("editdocumentdetails")
  }, [location.search]);
  // useEffect(() => {
  //   if (tab === "Sales") {
  //     settableData(salesTableData)
  //   } else if (tab === "All") {
  //     settableData(alltableData)
  //   }
  //   else {
  //     settableData(purchaseTableData)
  //   }
  // }, [tab])

  useEffect(() => {
    // Filter the table data based on the selected tab
    if (tab === "Sales") {
      settableData(salesTableData);

      // Filter statsType for Sales tab
      setstatusTiles(statsType.filter(type =>
        ['Sales Quotation', 'Order Confirmation', 'Sales Enquiry', 'Request Quotation', 'Delivery Challan'].includes(type.name)
      ));
      setdropDownType(dropdownItems.filter((ele) => !ele.includes('Purchase')))
    } else if (tab === "All") {
      settableData(alltableData);
      // Show all statsType
      setstatusTiles(statsType);
      setdropDownType(dropdownItems)
    } else if (tab === "Quotation") {
      settableData(salesTableData.filter(item => ['Sales Quotation', 'Sales Enquiry', 'Request Quotation'].includes(item.docType)));
      setstatusTiles(statsType.filter(type =>
        ['Sales Quotation', 'Sales Enquiry', 'Request Quotation'].includes(type.name)
      ));
      setdropDownType(['Sales Quotation', 'Sales Enquiry', 'Request Quotation'])
    } else {
      settableData(purchaseTableData);


      // Filter statsType for Purchase tab
      setstatusTiles(statsType.filter(type =>
        ['Purchase Order', 'Purchase Tax Invoice', "Inward Document", "Goods Received Note", "Credit Note", "Debit Note"].includes(type.name)
      ));
      setdropDownType(dropdownItems.filter((ele) => ele.includes('Purchase')))
    }
  }, [tab]);

  console.log()
  // Boolean states for permissions
  const [booladd, setbooladd] = useState(false);
  const [boolview, setboolview] = useState(false);
  const [tagPopup, setTagPopup] = useState({})
  const [tagsData, setTagsData] = useState([])
  const [data, setData] = useState({ tagType: 'Quotation' })
  const [error, setError] = useState({})
  const [statsCount, setStatsCount] = useState({})
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [clickedDocForTD, setClickedDocForTD] = useState({})
  const aclMap = userTokenDetails.aclMap ? userTokenDetails.aclMap : {}
  const userTypeId = userTokenDetails.type_id ? userTokenDetails.type_id : null
  const userEmail = userTokenDetails.email ? userTokenDetails.email : null
  const userId = userTokenDetails.user_id ? userTokenDetails.user_id : null
  const parentId = userTokenDetails.parentId !== undefined ? userTokenDetails.parentId : null
  useEffect(() => {
    console.log("inside s&P", selectedBuyer)
  }, [selectedBuyer])
  useEffect(() => {
    fetchTableData({ userId: userId, type_id: userTypeId })
    call('POST', 'getTags', { type: data.tagType }).then(res => {
      setTagsData([...res])
    })
  }, [refresh, clientType.type, contractState.info.refresh, filter, filterData])
  const handleRedirect = (item) => {
    setEditDocument({ ...item.details, docType: item.docType, idFromDB: item.id, sellerId: item.sellerId, buyerId: item.buyerId, itemStatus: item.status, transaction_timeline: item.transaction_timeline, docId: item.docId });
    setClickedDocForTD(item)
    setHideButtons(false)
    setShowTransactionDetails(true)
  };
  const handleRedirectToTimeline = (item) => {
    console.log(item.docId)
    setEditDocument({ ...item.details, docType: item.docType, idFromDB: item.id, sellerId: item.sellerId, buyerId: item.buyerId, itemStatus: item.status, transaction_timeline: item.transaction_timeline, docId: item.docId });
    setSelectedDocument(item.docType);
    setAddingNewDocument(false);
    setShowTransactionDetails(false)

    // setAddNewDocument(true);
    setShowTimeline(true);
  }
  const handleSelectChange = (selectedOptions) => {
    setSelectedDocument(selectedOptions);
    const quotationDocuments = [
      "Sales Quotation",
      "Delivery Challan",
      "Order Confirmation",
      "Invoice",
      "Sales Enquiry"
    ];

    const poDocuments = [
      "Purchase Order",
      "Purchase Tax Invoice",
      "Inward Document",
      "Goods Received Note",
      "Credit Note",
      "Debit Note"
    ];

    if (quotationDocuments.includes(selectedOptions)) {
      setQuotationIsModalOpen(true);
    } else if (poDocuments.includes(selectedOptions)) {
      setPOIsModalOpen(true);
    } else if (selectedOptions === "Request Quotation") {
      // setSelectedCompany(selectedCompany);
      setEditDocument({})
      setAddNewDocument(true);
      handleCloseModal();
      setAddingNewDocument(true)
      // setAddNewDocument(true);
    }

    // setHideButtons(false);
  };

  const [filteredData, setFilteredData] = useState([]);

  async function fetchTableData(inptObject) {
    setLoading(true);
    let objectAPI = {
      "currentPage": page,
      "resultPerPage": filter.resultPerPage,
      "userId": inptObject.userId ? inptObject.userId : userId,
      "type_id": inptObject.type_id ? inptObject.type_id : userTypeId,
      // "activeType": clientType.type,
      "userParentId": parentId,
      "gridOnly": true,
      search: filter.search
    }

    for (let index = 0; index < Object.keys(filterData || {}).length; index++) {
      let filterName = Object.keys(filterData)[index]
      const element = filterData[filterName];
      if (element.isFilterActive) {
        if (element.type === "checkbox") {
          objectAPI[element.accordianId] = []
          element["data"].forEach((i) => {
            if (i.isChecked) {
              objectAPI[element.accordianId].push((element.accordianId === "status" || element.accordianId === "financiersFilter" || element.accordianId === "timeLeft") ? i[element["labelName"]] : `'${i[element["labelName"]]}'`)
            }
          })
        }
        else if (element.type === "minMaxDate") {
          objectAPI[element.accordianId] = element["value"]
        }
      }
    }
    objectAPI["fromDate"] = objectAPI?.["dateRangeFilter"]?.[0]
    objectAPI["toDate"] = objectAPI?.["dateRangeFilter"]?.[1]
    if (objectAPI?.status?.includes("In-Pilot")) {
      objectAPI = {
        ...objectAPI,
        onlyPilot: true,
        onlyProgress: false,
        onlyComplete: false
      }
    }
    else if (objectAPI?.status?.includes("In-Progress")) {
      objectAPI = {
        ...objectAPI,
        onlyPilot: false,
        onlyProgress: true,
        onlyComplete: false
      }
    }
    else if (objectAPI?.status?.includes("Completed")) {
      objectAPI = {
        ...objectAPI,
        onlyPilot: false,
        onlyProgress: false,
        onlyComplete: true
      }
    }
    call('POST', 'getSalesPurchaseQuotation', objectAPI).then(async (result) => {
      let drafts = []
      // let drafts = await call('POST', 'getAllInvoiceLimitDrafts', { userId, forContract: true })
      // drafts = drafts.length ? drafts : []
      drafts = drafts.concat(result.data || [])
      settableData(drafts)
      setAllTableData(drafts)
      const allDocId = result?.salesDocs
        ?.filter(item => item.docType === "Sales Quotation")
        ?.map(item => item.docId) || []; // Extract docId values, fallback to an empty array

      console.log('Inside call api-- > ', result.salesDocs, allDocId);

      await call("POST", "getChangeLogsForContainer", { docId: allDocId })
        .then((result) => {
          setChangeLogsOfSQ(result)
          console.log("change logs in main page:", result)
        })
        .catch((e) => console.log("error in saving into db", e))
      setSalesTableData(result.salesDocs)
      setPurchaseTableData(result.purchaseDocs)
      // setStatsCount(result.countData)
      // setcontractCount(result.count)
      settableData(drafts)
      setFilteredData(drafts)
      setStatsCount(result.countData)
      setcontractCount(result.count)
      setLoading(false);
    }).catch((e) => {
      console.log('error in getContracts', e);
      setLoading(false);
    })
  }

  async function handleChange(e) {
    e.persist()
    setData({ ...data, [e.target.name]: e.target.value })
    setError({ ...error, [e.target.name]: "" })
  }

  function onTagPopupClose() {
    setTagPopup({ show: false })
    setrefresh(refresh + 1)
    setData({ ...data, tagName: undefined, selectTag: undefined })
  }

  console.log(filterData, "this is filterdata --->>>>>>>>>>>.")

  const handleStatusFilterChange = (e) => {
    const selectedStatus = e.target.value;
    let filteredtable = tableData;

    if (selectedStatus) {
      // Convert the selectedStatus and item.status to strings for comparison
      filteredtable = filteredData.filter(item => item.status.toString() === selectedStatus.toString());
      settableData(filteredtable)
    } else {
      settableData(filteredData)
    }


  };


  function sortKeysByCreationDate(obj) {
    // Check if the input is null or undefined
    if (obj === null || obj === undefined) {
      console.warn('Input object is null or undefined. Returning an empty object.');
      return {}; // Return an empty object if input is null or undefined
    }

    // Convert the object into an array of [key, value] pairs
    const entries = Object.entries(obj);

    // Sort the entries based on the date and time (value)
    const sortedEntries = entries.sort((a, b) => {
      const dateA = a[1] ? new Date(a[1]) : new Date(0); // Use a very old date for null values
      const dateB = b[1] ? new Date(b[1]) : new Date(0); // Use a very old date for null values

      return dateA - dateB;
    });

    // Convert the sorted entries back into an object
    const sortedObj = Object.fromEntries(sortedEntries);
    return sortedObj;
  }


  const getUniqueTags = (data) => {
    const allTags = data.flatMap(item => item.details?.tags || []);
    return [...new Set(allTags)]; // Get unique tags
  };
  const uniqueTags = getUniqueTags(tableData);


  const handleTagFilterChange = (e) => {
    const selectedTag = e.target.value.trim().toLowerCase();
    let filteredData = tableData;

    if (selectedTag) {
      filteredData = tableData.filter(item =>
        item.details?.tags?.some(tag => tag.toLowerCase() === selectedTag)
      );
    }

    settableData(filteredData); // This state will hold the filtered table data
  };

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    console.log("Selected start date:", start);
    console.log("Selected end date:", end);

    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      filterDataByDateRange(start, end);
    } else {
      settableData(filteredData); // Reset the table data if no range is selected
    }
  };

  const filterDataByDateRange = (start, end) => {
    // Ensure start and end are moment objects
    const startDate = moment(start).startOf('day');
    const endDate = moment(end).endOf('day');

    const filteredData = tableData.filter(item => {
      const itemDate = moment(item.createdAt); // Parse the ISO 8601 string
      return itemDate.isBetween(startDate, endDate, 'day', '[]');
    });

    settableData(filteredData);
  };



  const [activeFilter, setActiveFilter] = useState(null);


  const handleFilter = (docType) => {
    setActiveFilter(docType);
    setTimeout(() => {
      if (docType) {
        const newFilteredData = tableData.filter(item => item.docType === docType);
        console.log(newFilteredData, "filtered status---....");
        settableData(newFilteredData);
      }
    }, 0);
  };

  const handleClearFilter = () => {
    setActiveFilter(null);
    settableData(filteredData);
  };


  const [tablecol, setTablecol] = useState([
    { subColumns: "Quotation No", isChecked: true, isFixed: true, width: "11rem" },
    { subColumns: "Doc Type", isChecked: true, isFixed: true },
    { subColumns: "Creation Date", isChecked: true, },
    { subColumns: "Deal Owner", isChecked: true, isFixed: true, width: "10rem" },
    { subColumns: "Company", isChecked: true },
    { subColumns: "Total Amount", isChecked: false, },
    { subColumns: "Delivery Date", isChecked: true, },
    { subColumns: "Tags", isChecked: false, },
    { subColumns: "Contact No", isChecked: false, },
    { subColumns: "Payment Terms", isChecked: false, },
    { subColumns: "Inco Terms", isChecked: false, },
    { subColumns: "Deal Status", isChecked: true, isFixed: true, width: "13rem" },
    { subColumns: "Action", isChecked: true, isFixed: true },


  ]);


  const handleColumnVisibilityChange = (column) => {
    setTablecol(prevTablecol =>
      prevTablecol.map(col =>
        col.subColumns === column ? { ...col, isChecked: !col.isChecked } : col
      )
    );
  };


  useEffect(() => {
    console.log(tablecol, "its tablecoll");
  }, [tablecol]);




  useEffect(() => {
    const columnsCount = tablecol.filter(col => col.isChecked).length;
    if (columnsCount > 6) {
      document.querySelector('table').style.width = 'max-content';
    } else {
      document.querySelector('table').style.width = '100%';
    }
  }, [tablecol]);
  useEffect(() => {
    console.log("selectedDocType", selectedDocType)
    let data = alltableData.filter((item) => item.docType === selectedDocType) || []
    console.log("paginatedTableData", data.length)
    settableData(data)
  }, [selectedDocType])
  const [boolscroll, setboolscroll] = useState(true)
  const perPage = filter.resultPerPage || 10; // Default 10 rows per page
  const start = (page - 1) * perPage; // Calculate the starting index
  const end = start + perPage; // Calculate the ending index

  // Slice the tableData for the current page
  let paginatedTableData = tableData.slice(start, end);


  return (
    <>
      {addNewDocument && <AddDocument
        cameForEditingChangelogs={cameForEditingChangelogs}
        navToggleState={navToggleState}
        setrefresh={setrefresh}
        setAddNewDocument={setAddNewDocument}
        type={selectedDocument}
        setSelectedBuyer={setSelectedBuyer}
        setSelectedSeller={setSelectedSeller}
        buyer={addingNewDocument && selectedBuyer}
        seller={addingNewDocument && selectedSeller}
        editDocument={!addingNewDocument && editDocument}
        userTokenDetails={userTokenDetails}
        setEditDocument={setEditDocument}
        setSelectedDocument={setSelectedDocument}
        setShowTransactionDetails={setShowTransactionDetails}
        showTransactionDetails={showTransactionDetails}
        showTimeline={showTimeline}
        setShowTimeline={setShowTimeline}
      />}
      {!addNewDocument && !showTransactionDetails && !showTimeline && <>
        {tagPopup.show && (
          <FinanceInvoiceModal
            limitinvoice={tagPopup.show}
            setLimitinvoice={() => { onTagPopupClose() }}
            closeSuccess={() => { onTagPopupClose() }}
          >
            <div className="col-md-10 mb-2 ml-5">
              <label className="text-center font-wt-600 font-size-16 mb-4 w-100">
                Select Tag
              </label>
              <div className='position-relative'>
                <MultipleSelect singleSelection
                  Label={"Select Tag"}
                  Id={`selectTag`}
                  optiondata={tagsData}
                  onChange={(e) => {
                    handleChange(multiSelectEventHandler(e, `selectTag`, "name"))
                  }}
                  value={data[`selectTag`] ? [data[`selectTag`]] : []}
                  name={`selectTag`}
                  labelKey={"name"}
                  valKey={"name"}
                  error={error[`selectTag`]}
                />
              </div>
              <label className="text-center font-wt-600 font-size-16 my-4 w-100">
                OR Create New
              </label>
              <div className='position-relative'>
                <MultipleSelect isDisabled singleSelection
                  Label={"Tag Type"}
                  Id={`tagType`}
                  optiondata={[{ type: 'Quotation' }]}
                  onChange={(e) => {
                    handleChange(multiSelectEventHandler(e, `tagType`, "type"))
                  }}
                  value={data[`tagType`] ? [data[`tagType`]] : []}
                  name={`tagType`}
                  labelKey={"type"}
                  valKey={"type"}
                  error={error[`tagType`]}
                />
              </div>
              <div className='position-relative'>
                <NewInput name={"tagName"} value={data.tagName} label={"Tag Name"} onChange={handleChange}
                  error={error[`tagName`]} />
              </div>
              {tagPopup.data.details?.tags?.length ? <>
                <label className="text-center font-wt-600 font-size-16 my-4 w-100">
                  OR Remove Tag
                </label>
                <div className='d-flex row'>
                  {tagPopup.data.details?.tags?.map((i, j) => {
                    return (<div
                      onClick={() => {
                        let tempTags = tagPopup.data.details?.tags
                        tempTags = tempTags.filter(tagName => {
                          if (tagName != i) { return true }
                        })
                        let updatedTagPopup = tagPopup
                        updatedTagPopup["data"]["details"]["tags"] = tempTags
                        setTagPopup({ ...updatedTagPopup })
                      }}
                      className='col-6 cursor'>
                      <label className='font-size-13 font-wt-500 cursor'>{i}
                        <img src='assets/images/cancel-icon.png' className='mx-2 cursor' />
                      </label>
                    </div>)
                  })}
                </div></> : null}
              <div className='d-flex row justify-content-center mt-4'>
                <button
                  className={`new-btn py-2 px-2 text-white cursor w-35`}
                  onClick={async () => {
                    if (!(data.selectTag || (data.tagType && data.tagName))) {
                      // update tags
                      setLoading(true)
                      console.log("tagpopup", tagPopup)
                      console.log("tagpopup data", data)

                      await call('POST', 'updateSalesPurchaseQuotation', {
                        status: tagPopup.data.status,
                        sellerId: tagPopup.data.sellerId, buyerId: tagPopup.data.buyerId,
                        data: { ...tagPopup.data.details, tags: tagPopup.data.details?.tags },
                        appId: tagPopup.data.id,
                        docType: tagPopup.data.docType,
                        docId: tagPopup.data.docId,
                        transaction_timeline: tagPopup.data.transaction_timeline
                      })
                      setLoading(false)
                      onTagPopupClose()
                    }
                    else {
                      setLoading(true)
                      let tagNameToSet = data.selectTag
                      // first save the tag
                      if (data.tagType && data.tagName) {
                        await call("POST", 'createNewTag', { type: data.tagType, name: data.tagName })
                        tagNameToSet = data.tagName
                      }
                      // update tag to transaction
                      let existingTags = tagPopup.data.details.tags || []
                      existingTags = existingTags.filter(i => {
                        if (tagNameToSet != i) { return true }
                      })
                      console.log("tagpopup", tagPopup)
                      console.log("tagpopup data", data)

                      existingTags.push(tagNameToSet)
                      await call('POST', 'updateSalesPurchaseQuotation', {
                        sellerId: tagPopup.data.sellerId, buyerId: tagPopup.data.buyerId,
                        data: { ...tagPopup.data.details, tags: existingTags },
                        appId: tagPopup.data.id,
                        docType: tagPopup.data.docType,
                        docId: tagPopup.data.docId,
                        status: tagPopup.data.status,
                        transaction_timeline: tagPopup.data.transaction_timeline

                      })
                      setLoading(false)
                      onTagPopupClose()
                    }
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </FinanceInvoiceModal>
        )}
        {loading && (<div className="loading-overlay"><span><img className="" src="assets/images/loader.gif" alt="description" /></span></div>)}
        <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
        <div className='d-flex justify-content-start'>
          <div className='d-flex w-100  m-0 p-1 mt-3 custom-scrollbarX' style={{ gap: '1rem', boxShadow: "none" }}>
            {Array.isArray(statsCount) && statsCount.length > 0 ? (
              statsCount
                .filter(item =>
                  tab === "All" ||
                  (tab === "Sales" && ["Sales Quotation", "Order Confirmation", "Sales Enquiry", "Request Quotation", "Delivery Challan"].includes(item.docType)) ||
                  (tab === "Purchase" && ["Purchase Order", "Purchase Tax Invoice", "Inward Document", "Goods Received Note", "Credit Note", "Debit Note"].includes(item.docType))
                )
                .map((item, j) => {
                  const colorSet = docTypeColors[item.docType] || {};
                  return (
                    <div
                      key={j}
                      onClick={() => setSelectedDocType(item.docType)}
                      className="card border1Blue d-flex justify-content-center cursor p-2"
                      style={{ minWidth: "15%", minHeight: "15%" }}
                    >
                      <div>
                        <p className="font-size-18 font-wt-600 p-0 m-0" style={{ color: colorSet.base || "#000" }}>
                          {item.docType || 0}
                        </p>
                        <p className="font-size-16 font-wt-400 colorFFC107 p-0 m-0 mt-3">
                          {item.count}
                        </p>
                      </div>
                    </div>
                  );
                })
            ) : <p>Loading...</p>}

          </div>
          {/* <div style={{ height: "80px", right: "0" }} className=" bg-white border rounded shadow p-2 position-absolute d-flex m-3">
            <button style={{ width: "130px" }}
              className={`btn ${activeButton === 'sales' ? 'btn-dark' : 'btn-light'} me-1 fs-5`}
              onClick={() => handleButtonClick('sales')}
            >
              Sales
            </button>
            <button style={{ width: "130px" }}
              className={`btn ${activeButton === 'purchase' ? 'btn-dark' : 'btn-light'} fs-5`}
              onClick={() => handleButtonClick('purchase')}
            >
              Purchase
            </button>
          </div> */}
        </div>


        <div className='filter-div position-relative'>

          <FilterNew
            filterData={filterData}
            setFilterData={setFilterData}
            showFilterBtn={true}
            showResultPerPage={true}
            count={alltableData.length}
            filter={filter}
            setFilter={setFilter}
            refresh={refresh}
            setRefresh={setrefresh}
            isAdditionalButton
            userTokenDetails={userTokenDetails}
            activeFilter={activeFilter}
            uniqueTags={uniqueTags}
            handleTagFilterChange={handleTagFilterChange}
            handleStatusFilterChange={handleStatusFilterChange}
            startDate={startDate}
            endDate={endDate}
            handleDateRangeChange={handleDateRangeChange}
            handleClearFilter={handleClearFilter}
            tablecol={tablecol}
            setTablecol={setTablecol}
            handleColumnVisibilityChange={handleColumnVisibilityChange}
          >
            {userTokenDetails.main_user_name !== "Admin FOB" && (
              <div className="d-flex gap-4">
                <DropdownSearch className="new-btn" items={dropDownType} onSelect={handleSelectChange} placeholder={"Create Document"} customStyles={{ bgColor: "#5CB8D3", bgText: "white" }} />

                <div className="new-btn p-2" onClick={() => {
                  fetchTableData({ userId: userId, type_id: userTypeId })
                }}>
                  <img className="p-0 m-0" src='assets/images/reload.png' />
                </div>

                {isQuotaionModalOpen && (

                  < AddNewBuyerPopUp userTokenDetails={userTokenDetails} setAddingNewDocument={setAddingNewDocument} setHideButtons={setHideButtons} handleCloseModal={handleCloseModal} typeOf={"Buyer"} setSelectedCompany={setSelectedBuyer} setAddNewDocument={setAddNewDocument} />
                )}
                {isPOModalOpen && (

                  < AddNewBuyerPopUp userTokenDetails={userTokenDetails} setAddingNewDocument={setAddingNewDocument} setHideButtons={setHideButtons} handleCloseModal={handleCloseModal} typeOf={"Seller"} setSelectedCompany={setSelectedSeller} setAddNewDocument={setAddNewDocument} />
                )}
                {/* {isOCModalOpen && (
                  <AddNewBuyerPopUp setAddingNewDocument={setAddingNewDocument} setHideButtons={setHideButtons} handleCloseModal={handleCloseModal} typeOf={"Buyer"} setSelectedCompany={setSelectedBuyer} setAddNewDocument={setAddNewDocument} />
                )} */}

              </div>
            )}
          </FilterNew>

          <div
          >
            {userTokenDetails.main_user_name !== "Admin FOB" && (
              <div className="d-flex flex-column gap-4">


              </div>
            )}
          </div>




        </div>
        {Array.isArray(tableData) &&
          <div style={{ marginTop: "0rem", display: tableData.length > 0 ? "block" : "none" }}>

            <div className="table-wrapper">
              <NewTablev2
                // freezeFirstColumn={true}
                // stickTableHeaderToTop={true}
                // style={{ width: tablecol.filter(col => col.isChecked).length > 5 ? 'max-content' : '100%' }}
                columns={tablecol.filter(col => col.isChecked)}
                boolscroll={boolscroll}
                tableStyles={{ width: '84rem' }}
              >
                {
                  paginatedTableData?.map((item, i) => {
                    return (
                      <tr key={i}>
                        {tablecol.map((col) => {
                          if (col.isChecked) {
                            return (
                              <td key={col.subColumns}>
                                {col.subColumns === "Action" && (
                                  <div
                                    className='position-relative'>
                                    <i className="fa fa-ellipsis-v cursor mt-2 ml-2"
                                      onClick={() => {
                                        setAction({ show: true, index: i })
                                      }}
                                      aria-hidden="true"></i>

                                    {
                                      statusAction.show && action.index === i ? (
                                        <Action
                                          id={i}
                                          onDismiss={() => setStatusAction({ show: false, index: i })}
                                          options={[
                                            // { name: "Pending", onClick: () => handleStatusChange("Pending", item) },
                                            { name: "Won", onClick: () => handleStatusChange(3, item) },
                                            { name: "Cancelled", onClick: () => handleStatusChange(4, item) },
                                            { name: "Lost", onClick: () => handleStatusChange(2, item) }
                                          ]}
                                        />
                                      ) : action.show && action.index === i ? (
                                        <Action
                                          id={i}
                                          onDismiss={() => setAction({ show: false, index: i })}
                                          options={[
                                            {
                                              name: "Transaction", onClick: () => {
                                                handleRedirectToTimeline(item)
                                                // setEditDocument({ ...item.details, idFromDB: item.id, sellerId: item.sellerId, buyerId: item.buyerId, itemStatus: item.status });
                                                // setSelectedDocument(item.docType);
                                                // setAddingNewDocument(false);
                                                // // setAddNewDocument(true);
                                                // setShowTimeline(true);

                                              }
                                            },
                                            { name: 'Manage Tag', onClick: () => setTagPopup({ show: true, data: item }) },
                                            item['status'] === 0 && { name: 'Change Status', onClick: () => setStatusAction({ show: true, index: i }) }
                                          ]}
                                        />
                                      ) : null}
                                  </div>
                                )}
                                {col.subColumns === "Quotation No" && (
                                  <>
                                    <label onClick={() => handleRedirect(item)}><label className='font-size-13 qwertyu font-wt-400 text-break text-primary cursor m-0' >{item.docId}  </label><img className='ps-2 cursor' src="assets/images/open-link.png" />  </label>

                                    {item.docType === "Sales Quotation" &&
                                      changeLogsOfSQ?.find((log) => log.docId === item.docId)?.changedBy && (
                                        <label className="d-flex align-items-center text-danger" style={{ fontSize: "10px" }}>
                                          <span
                                            className="d-inline-flex justify-content-center align-items-center rounded-circle text-white fw-bold me-2"
                                            style={{
                                              width: "15px",
                                              height: "15px",
                                              fontSize: "10px",
                                              backgroundColor: "rgb(239, 142, 142)", // Light red
                                              color: "rgb(197, 119, 119)", // Slightly darker red for contrast
                                            }}
                                          >
                                            i
                                          </span>
                                          Revised By{" "}
                                          {changeLogsOfSQ.find((log) => log.docId === item.docId)?.changedBy}
                                        </label>
                                      )}


                                  </>

                                )}
                                {col.subColumns === "Doc Type" && (
                                  <label className='font-size-13 font-wt-400 text-break'>{item.docType || "-"}</label>
                                )}
                                {col.subColumns === "Creation Date" && (
                                  <label className='font-size-13 font-wt-400 text-break'>{moment(item.createdAt).format('YYYY-MM-DD')}</label>
                                )}
                                {col.subColumns === "Deal Owner" && (
                                  <label className='font-size-13 font-wt-400 text-break'>
                                    {item.details?.clientContactName || (() => {

                                      const sellerIds = JSON.parse(item.sellerId || "[]");
                                      if (typeof sellerIds === "number") {
                                        return item.details?.clientContactName || "-";
                                      } else if (sellerIds.length > 1) {
                                        // Multiple companies selected
                                        return sellerIds
                                          .map((id) => item.details?.[id]?.clientContactName || "-")
                                          .join(", ");
                                      } else {
                                        return "-";
                                      }
                                    })()}
                                  </label>

                                )}
                                {col.subColumns === "Company" && (
                                  <label className='font-size-13 font-wt-400 text-break'>{item.details?.shipToCompanyName || "-"}</label>
                                )}
                                {col.subColumns === "Total Amount" && (
                                  <label className='font-size-13 font-wt-400 text-break'>{item.details?.invTotalAmount ? item.details?.invTotalAmount + " " + item.details?.invCurrency : "NA"}</label>
                                )}
                                {col.subColumns === "Delivery Date" && (
                                  <label className='font-size-13 font-wt-400 text-break'>{item.details.deliveryDate ? moment(item.details.deliveryDate).format('YYYY-MM-DD') : "-"}</label>
                                )}
                                {col.subColumns === "Tags" && (
                                  <label className='font-size-13 font-wt-500 text-break text-color1'>{item.details.tags ? item.details.tags.join(", ") : "-"}</label>
                                )}
                                {col.subColumns === "Contact No" && (
                                  <label className='font-size-13 font-wt-500 text-break text-color1'>{item.details.clientContactNo ? item.details.clientContactNo : "-"}</label>
                                )}
                                {col.subColumns === "Payment Terms" && (
                                  <label className='font-size-13 font-wt-500 text-break text-color1'>{item.details.paymentTerms ? item.details.paymentTerms : "-"}</label>
                                )}
                                {col.subColumns === "Inco Terms" && (
                                  <label className='font-size-13 font-wt-500 text-break text-color1'>{item.details.IncoTerms ? item.details.IncoTerms : "-"}</label>
                                )}
                                {col.subColumns === "Deal Status" && (
                                  <div>
                                    {item.transaction_timeline && Object.keys(sortKeysByCreationDate(item.transaction_timeline)).join(" / ")}
                                  </div>
                                  // <div>
                                  //   {item.status / 1 === 0 || item.status / 1 === 1 ? (
                                  //     <button type="button" className={`${item.status / 1 === 0 ? "inprogress" : "docDraft"} text-white border-0`}>
                                  //       {item.status / 1 === 1 ? "Draft" : "Pending"}
                                  //     </button>
                                  //   ) : item.status / 1 === 5 ? (
                                  //     <button type="button" className="expiredStatus text-white border-0">{"Cancelled"}</button>
                                  //   ) : item.status / 1 === 2 ? (
                                  //     <button type="button" className="rejected text-white border-0">{"Lost"}</button>
                                  //   ) : item.status / 1 === 3 ? (
                                  //     <button type="button" className="approved text-white border-0">{"Won"}</button>
                                  //   ) : null}
                                  // </div>
                                )}

                              </td>
                            );
                          }
                          return null;
                        })}
                      </tr>
                    );
                  })

                }
              </NewTablev2>


            </div>

            <Pagination page={page} totalCount={alltableData?.length} onPageChange={(p) => setPage(p)} refresh={refresh} setRefresh={setrefresh} perPage={filter.resultPerPage || 0} />
          </div>}
        <h2 style={{ color: "rgb(255, 123, 109)", display: tableData.length > 0 ? "none" : "block" }} className="text-center m-5 rounded">--- No Entries ---</h2>

      </>
      }

      {
        showTransactionDetails && !showTimeline && <TransactionDetails setEditDocument={setEditDocument} setCameForEditingChangelogs={setCameForEditingChangelogs} showTimelineBtn={true} setShowTimeline={setShowTimeline} setSelectedDocument={setSelectedDocument} setAddNewDocument={setAddNewDocument} setHideButtons={setHideButtons} handleGoBack={setShowTransactionDetails} editDocument={editDocument} userTokenDetails={userTokenDetails} />
      }

      {
        showTimeline && !showTransactionDetails &&
        <TransactionTimeline
          userId={userId}
          setShowTimeline={setShowTimeline}
          setAddNewDocument={setAddNewDocument}
          setSelectedDocument={setSelectedDocument}
          setHideButtons={setHideButtons}
          handleGoBack={setShowTimeline}
          editDocument={editDocument} />
      }

    </>

  )

}

const mapStateToProps = state => {
  return {
    cDetailsState: state.contractDetails,
    contractState: state.contract,
    clientType: state.clientType,
    navToggleState: state.navToggleState
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setContractDetails: (id) => { dispatch(setContractDetails({ cId: id, modal: true })) },
    setContractState: (flag, data) => { dispatch(setContractState({ modal: flag, info: data })) },
    setContractDocList: (id, data) => { dispatch(setContractDocList({ modal: true, contractId: id, info: data })) },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SalesAndPurchaseTab)