//----------------------------------------------------------------------
// Components Import
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.min.js";

import Login from "./components/homeComponents/login.js";
import Logout from "./components/homeComponents/logout.js";
import ChannelPartner from "./components/homeComponents/channelPartner.js";
import shipment from "./components/logistics/shipmentV2.js";
import ContractGrid from "./components/contractGrid/contractList.js";
import Payment from "./components/payments/payment.js";
import Tracking from "./components/contractGrid/tracking.js";
import Admin from "./components/admin/adminMain.js";
import ManageProfile from "./components/admin/manageProfile.js";
import CommoditiesList from "./components/commodityFormandMaster/commoditiesList.js";
import AllNotification from "./components/notifications/allNotifications.js";
import AllCreditLines from "./components/creditLineComp/CreditLines.js";
import AllCounterPart from "./components/myCounterPartComp/myCounterPart.js";
import AllBuyerLines from "./components/buyerLineComp/buyerLine.js";
import ContractDoc from "./components/contractDetails/contractDetails.js";
import Land from "./components/homeComponents/land.js";
import Ships from "./components/ships/ships.js";
import quotationContract from "./components/logistics/openQuotation.js";
import quotationslist from "./components/logistics/quotationslist.js";
import Registration from "./components/registration/registration.js";
import EditProfile from "./components/userProfile/editProfile.js";
import Finance from "./components/finance/financeGrid.js";
import Dashboard from "./components/Dashboard/index.js";
import ShowPlans from "./components/subscriptionPlans/showPlans.js";
import BuyPlans from "./components/subscriptionPlans/buyPlans.js";
import SubscriptionGrid from "./components/admin/subscriptionGrid.js";
import UserDirectory from "./components/userDirectory/userDirectory.js";
import ContractDirectoryGrid from "./components/contractDirectory/contractDirectoryGrid.js";
import ChangePassword from "./components/userProfile/updatePassword.js";
import CreditLineUsers from "./components/creditLineComp/creditLineUsers.js";
import Setting from "./components/settingComp/eligibleCriteria.js";
import ManageProduct from "./components/manageProductComp/manageProduct.js";
import RateCalculator from "./components/rateCalculatorComp/rateCalculator.js";
import FinanceRequest from "./components/finance/financeRequest.js";
import Reports from "./components/reportsComp/report.js";
import UserDetailedList from "./components/userProfile/userDetailedList.js";
import DocumentView from "./components/utilComponents/documentView.js";
import InsuranceCasesList from "./components/insurance/insuranceCases";
import ChannelPartnerAgreement from "./components/channelPartner/channelPartnerAgreement.js";
//----------------------------------------------------------------------

//----------------------------------------------------------------------
// Functions Import
import {
  getUserDataFromCookie,
  removeCookieandAvatar,
} from "./utils/cookieHelper";
import { initSocket } from "./socket";
import inactivityWatcher from "./utils/inactivityWatcher";
import POGrid from "./components/purchaseOrder/poGrid.js";
import RateDashboard from "./components/ships/rateList/rateDashboard.js";
import LCFastDashboard from "./components/lcFast/lcFastDashboard.js";
import MarketPlace from "./components/marketplace/Marketplace.js";
import MyBookingsDashboard from "./components/ships/marketPlaceBookings/myBookingsDashboard.js";
import ChannelPartnerUserList from "./components/channelPartner/channelPartnerUserList.js";
import ChannelPartnerList from "./components/channelPartner/channelPartnerList.js";
import ShipmentQuotationsDashboard from "./components/ships/marketPlaceBookings/shipmentQuotations/shipmentQuotationsDashboard.js";
import quotationslistV2 from "./components/logistics/quotationslistV2.js";
import reportForFinancier from "./components/reportsComp/reportForFinancier.js";
import AccountList from "./components/channelPartner/accountList.js";
import DisbursedInvoice from "./components/channelPartner/disbursedInvoices.js";
import RaisedInvoice from "./components/channelPartner/raisedInvoices.js";
import markeplaceQuotationDashboard from "./components/logistics/markeplaceQuotationDashboard.js";
import FinanceDetailView from "./components/finance/financeDetailView.js";
import RefLink from "./components/homeComponents/refLink.js";
import chatRooms from "./components/chatRooms/chatRooms.js";
import rateManagement from "./components/ships/freightForwarders/rateManagement.js";
import uploadDumpRates from "./components/ships/rateList/uploadDumpRates.js";
import financeCalculator from "./components/rateCalculatorComp/financeCalculator.js";
import InterestRates from "./components/rateCalculatorComp/interestRates.js";
import NewRegistration from "./components/registration/newRegistration.js";
import NewLogin from "./components/registration/newLogin.js";
import lcFastDashboardV2 from "./components/lcFast/lcFastDashboardV2.js";
import { HandleRedirect } from "./components/handleRedirects.js";
import DashboardV2 from "./components/Dashboard/DashboardV2.js";
import buyerManagement from "./components/myCounterPartComp/buyerManagement.js";
import Invoice from "./components/InvoiceDiscounting/Invoice.js";
import ApplyLimitComponent from "./components/InvoiceDiscounting/applyLimitComponent.js";
import Quotes from "./components/InvoiceDiscounting/quotes.js";
import seeQuotesDetails from "./components/InvoiceDiscounting/components/seeQuotesDetails";
import Contract from "./components/InvoiceDiscounting/contract/contract.js";
import signContract from "./components/InvoiceDiscounting/contract/components/signContract";
import ApplyForFinance from "./components/InvoiceDiscounting/applyForFinance/applyForFinance";
import ApplyFinancebtn from "./components/InvoiceDiscounting/applyForFinance/components/applyFinancebtn.js";
import ApprovedFinance from "./components/InvoiceDiscounting/approvedFinance/approvedFinance.js";
import ViewInvoiceDetails from "./components/InvoiceDiscounting/approvedFinance/viewDetails.js";
import ApplyforLimit from "./components/lcV2/applyforLimit/applyforLimit.js";
import quotes from "./components/lcV2/qoutes/quotes";
import contract from "./components/lcV2/contract/contract";
import approvedFinance from "./components/lcV2/approvedFinance/approvedFinance";
import applyforFinance from "./components/lcV2/applyforFinance/applyforFinance";
import amendment from "./components/lcV2/amendment/amendment";
import Lcdiscountingcard from "./components/lcV2/applyforLimit/components/lcdiscountingcard.js";
import finInvoiceQuotes from "./components/InvoiceDiscounting/financier/quotesMenu/quotes.js";
import finQuotesDetails from "./components/InvoiceDiscounting/financier/quotesMenu/viewDetails.js";
import termSheet from "./components/InvoiceDiscounting/financier/sendTermSheet/termSheet.js";
import sendTermSheet from "./components/InvoiceDiscounting/financier/sendTermSheet/sendTermSheet.js";
import signTermSheet from "./components/InvoiceDiscounting/financier/signTermSheet/termSheet.js";
import viewSignTermSheet from "./components/InvoiceDiscounting/financier/signTermSheet/signTermSheet.js";
import financeApplication from "./components/InvoiceDiscounting/financier/financeApplication/financeApplication.js";
import viewFinanceApplication from "./components/InvoiceDiscounting/financier/financeApplication/viewFinanceApp.js";
import disbursement from "./components/InvoiceDiscounting/financier/disbursement/disbursement.js";
import disbursementDetails from "./components/InvoiceDiscounting/financier/disbursement/disbursementDetails.js";
import lcSeequotes from "./components/lcV2/qoutes/components/lcSeequotes";
import applyforSblc from "./components/lcV2/qoutes/components/applyforSblc";
import InvoiceAgreement from "./components/InvoiceDiscounting/applyForFinance/invoiceAgreement";
import signAgreement from "./components/InvoiceDiscounting/applyForFinance/signAgreement";
import lcSignContract from "./components/lcV2/contract/components/lcSignContract";
import LcApplyFinanceBtn from "./components/lcV2/applyforFinance/components/lcApplyfinancebtn.js";
import amendApplication from "./components/lcV2/amendment/components/amendApplication.js";
import quickFinance from "./components/quickFinance/quickFinance";
import ammendLC from "./components/lcV2/applyforFinance/components/ammendLC";
import wallet from "./components/wallet/wallet";
import pricing from "./components/wallet/components/pricing";
import viewDetails from "./components/wallet/components/viewDetails";
import supplierList from "./components/myCounterPartComp/supplierList";
import finLCQuotes from "./components/lcV2/financier/quotesMenu/quotes.js";
import finLCQuotesDetails from "./components/lcV2/financier/quotesMenu/viewDetails.js";
import lcRequestLetter from "./components/lcV2/financier/reQuestLetter/requestLetter.js";
import viewRequestLetter from "./components/lcV2/financier/reQuestLetter/viewRequestLetter.js";
import sendLC from "./components/lcV2/financier/sendLC/sendLC.js";
import viewSendLC from "./components/lcV2/financier/sendLC/viewSendLC";
import lcFinApplication from "./components/lcV2/financier/lcFinApplication/lcFinApplication.js";
import viewLCFinApplication from "./components/lcV2/financier/lcFinApplication/viewLCFinApplication.js";
import viewProfile from "./components/viewProfile/viewProfile";
import ChatRoomV2 from "./components/chatRoom/chatRoom";
import amendmentRequest from "./components/lcV2/applyforFinance/components/amendmentRequest";
import amendmentDetails from "./components/InvoiceDiscounting/applyForFinance/components/amendmentDetails";
import DocsRequested from "./components/lcV2/qoutes/components/docsRequested";
import supplierDetails from "./components/myCounterPartComp/supplierDetails";
import sblcQuotations from "./components/lcV2/applyforFinance/components/sblcQuotations";
import sblcQuotationDetails from "./components/lcV2/applyforFinance/components/sblcQuotationDetails";
import signEximBankTermSheet from "./components/lcV2/financier/quotesMenu/signEximBankTermSheet";
import "./firebase.js";
// Import the functions you need from the SDKs you need
import sblcTermSheet from "./components/lcV2/applyforFinance/components/sblcTermSheet";
import walletV2 from "./components/wallet/walletV2";
import reportsv2 from "./components/Reports/reportsv2";
import helpSupport from "./components/helpSupport/helpSupport";
import allNotifications from "./components/allNotifications/allNotifications";
import PaymentScreen from "./components/wallet/PaymentScreen";
import FailedPayment from "./components/wallet/FailedPayment";
import SuccessPayment from "./components/wallet/SuccessPayment";
import { DisbursementV2 } from "./components/InvoiceDiscounting/financier/disbursement/disbursementV2";
import PageNotFound from "./components/pageNotFound";
import toastDisplay from "./utils/toastNotification";
import { ToastContainer } from "react-toastify";
import InvoiceLimit from "./components/adminNewUI/InvoiceLimit/InvoiceLimit";
import InvoiceFinance from "./components/adminNewUI/InvoiceFinance/InvoiceFinance";
import InvoiceApprovedFinance from "./components/adminNewUI/InvoiceApprovedFinance/InvoiceApprovedFinance";
import UserOnboard from "./components/UserOnboard/UserOnboard";
import LCLimit from "./components/adminNewUI/letterOfCredit/LCLimit";
import AdminPayments from "./components/adminNewUI/AdminPayments";
import TaskManager from "./components/TaskManager/TaskManager";
import SubAdminProfileDetails from "./components/adminNewUI/SubAdminProfile/SubAdminProfileDetails";
import PayUPaymentScreen from "./components/wallet/PayUPaymentScreen";
import applyMultFinanceBtn from "./components/InvoiceDiscounting/applyForFinance/components/applyMultFinanceBtn";
import EnquiryList from "./components/TaskManager/EnquiryList";
import CallList from "./components/TaskManager/CallList";
import LeadsComponent from "./components/CRM/LeadsComponent";
import CRMDataComponent from "./components/CRM/CRMDataComponent";
import CRMMasterData from "./components/CRM/CRMMasterData";
import InvoiceGenerateFinancier from "./components/InvoiceGeneration/InvoiceGenerateFinancier";
import InvoiceGenerateCP from "./components/InvoiceGeneration/InvoiceGenerateCP";
import AdminReports from "./components/Reports/AdminReports";
import CRMUserProfile from "./components/CRM/CRMUserProfile";
import CRMAssignScreen from "./components/CRM/CRMAssignScreen";
import TTVBuyerDetail from "./components/myCounterPartComp/TTVBuyerDetail";
import Corporate from "./components/TaskManager/Corporate";
import Financer from "./components/TaskManager/Financer";
import ApplicationForm from "./components/TaskManager/ApplicationForm";
import AddFinancer from "./components/TaskManager/AddFinancer";
import TradeDiscovery from "./components/myCounterPartComp/TradeDiscovery";
import SubAdminTab from "./components/adminNewUI/SubAdminProfile/SubAdminTab";
import ExtraDetailsForLimitApplication from "./components/InvoiceDiscounting/extraDetailsForLimitApplication";
import BuyerCreditCheck from "./components/underWriting/BuyerCreditCheck";
import SupplierCreditCheck from "./components/underWriting/SupplierCreditCheck";
import applyLimitComponentV2 from "./components/InvoiceDiscounting/applyLimitComponentV2";
import lcdiscountingcardV2 from "./components/lcV2/applyforLimit/components/lcdiscountingcardV2";
import InvoiceApprovedFinance2 from "./components/adminNewUI/InvoiceApprovedFinance/InvoiceApprovedFinance2";
import BGGetConfirmation from "./components/bankGuarantee/BGGetConfirmation";
import BGQuote from "./components/bankGuarantee/BGQuote";
import BGQuoteDetails from "./components/bankGuarantee/BGQuoteDetails";
import BGSignTermSheet from "./components/bankGuarantee/BGSignTermSheet";
import BGConfirmed from "./components/bankGuarantee/BGConfirmed";
import WCApplyLimit from "./components/workingCapital/WCApplyLimit";
import WCQuote from "./components/workingCapital/WCQuote";
import BGFinancierQuote from "./components/bankGuarantee/BGFinancierQuote";
import BGFinancierSendQuote from "./components/bankGuarantee/BGFinancierSendQuote";
import BGFinancierSendTermSheet from "./components/bankGuarantee/BGFinancierSendTermSheet";
import BGConfirmedFinancier from "./components/bankGuarantee/BGConfirmedFinancier";
import WCQuoteDetails from "./components/workingCapital/WCQuoteDetails";
import WCSignTermSheet from "./components/workingCapital/WCSignTermSheet";
import WCFinancierQuote from "./components/workingCapital/WCFinancierQuote";
import WCFinancierSendQuote from "./components/workingCapital/WCFinancierSendQuote";
import WCFinancierSendTermSheet from "./components/workingCapital/WCFinancierSendTermSheet";
import ApplyLimitSCF from "./components/SupplyChainFinance/ApplyLimitSCF";
import SCFQuote from "./components/SupplyChainFinance/SCFQuote";
import SCFApprovedLimit from "./components/SupplyChainFinance/SCFApprovedLimit";
import ApplyFinanceDID from "./components/DomesticInvoiceDiscounting/ApplyFinanceDID";
import ApplyLimitCGTMSE from "./components/CGTMSE/ApplyLimitCGTMSE";
import CGTMSEQuote from "./components/CGTMSE/CGTMSEQuote";
import CGTMSEQuoteDetails from "./components/CGTMSE/CGTMSEQuoteDetails";
import CGTMSESignTermSheet from "./components/CGTMSE/CGTMSESignTermSheet";
import CGTMSEFinancierSendQuote from "./components/CGTMSE/CGTMSEFinancierSendQuote";
import CGTMSEFinancierSendTermSheet from "./components/CGTMSE/CGTMSEFinancierSendTermSheet";
import { CGTMSEFinancierQuote } from "./components/CGTMSE/CGTMSEFinancierQuote";
import SCFQuoteDetails from "./components/SupplyChainFinance/SCFQuoteDetails";
import SCFFinancierQuote from "./components/SupplyChainFinance/SCFFinancierQuote";
import SCFFinancierSendQuote from "./components/SupplyChainFinance/SCFFinancierSendQuote";
import SCFFinancierSendTermsheet from "./components/SupplyChainFinance/SCFFinancierSendTermsheet";
import SCFSignTermsheet from "./components/SupplyChainFinance/SCFSignTermsheet";
import SCFForwardApplication from "./components/SupplyChainFinance/SCFForwardApplication";
import call from "./service";
import store from "./store";
import { setNavbarConfiguration } from "./store/actions/action";
import { useSelector } from "react-redux";
import {
  FinanciersNavConfig,
  buyersNavConfig,
  exportersNavConfig,
  AdminConfig,
  CPNavConfig,
  shipperConfig,
} from "./utils/myFunctions";
import DocVaultTransaction from "./components/documentVault/DocVaultTransaction";
import DocVaultTransactionDetails from "./components/documentVault/DocVaultTransactionDetails";
import TradeCreditInsuarance from "./components/InsuaranceNew/TradeCreditInsuarance";
import TCISingleBuyer from "./components/InsuaranceNew/TCISingleBuyer";
import TCITransactional from "./components/InsuaranceNew/TCITransactional";
import TCIWholeTO from "./components/InsuaranceNew/TCIWholeTO";
import TCIKeyAccounts from "./components/InsuaranceNew/TCIKeyAccounts";
import InvoiceAgreementV2 from "./components/InvoiceDiscounting/applyForFinance/InvoiceAgreementV2";
import SignAgreementV2 from "./components/InvoiceDiscounting/applyForFinance/SignAgreementV2";
import Settings from "./components/Settings/Settings";
import DashboardV3 from "./components/Dashboard/DashboardV3.js";
import CRMFolderComponent from "./components/CRM/CRMFolderComponent.js";
import WCAdminQuote from "./components/workingCapital/WCAdminQuote.js";
import CGTMSEQuoteAdmin from "./components/CGTMSE/CGTMSEQuoteAdmin.js";
import BGQuoteAdmin from "./components/bankGuarantee/BGQuoteAdmin.js";
import SCFQuoteAdmin from "./components/SupplyChainFinance/SCFQuoteAdmin.js";
import CPInvoiceLimit from "./components/adminNewUI/InvoiceLimit/CPInvoiceLimit.js";
import CPInvoiceFinance from "./components/adminNewUI/InvoiceFinance/CPInvoiceFinance.js";
import CPInvoiceApprovedFinance from "./components/adminNewUI/InvoiceApprovedFinance/CPInvoiceApprovedFinance.js";
import CPLCLimit from "./components/adminNewUI/letterOfCredit/CPLCLimit.js";
import WorkOrderContract from "./components/contractManagement/WorkOrderContract.js";
import CreateWorkOrderContract from "./components/contractManagement/CreateWorkOrderContract.js";
import CommoditiesListV2 from "./components/commodityFormandMaster/CommoditiesListV2.js";
import WorkOrderContractDetails from "./components/contractManagement/WorkOrderContractDetails.js";

import ApplyForBooking from "./components/ShipmentBooking/ApplyForBooking.js";
import ShipmentBookingQuotes from "./components/ShipmentBooking/ShipmentBookingQuotes.js";
import ShipmentQuoteDetails from "./components/ShipmentBooking/ShipmentQuoteDetails.js";
import ShipmentShipperQuote from "./components/ShipmentBooking/ShipmentShipperQuote.js";
import ShipmentShipperSendQuote from "./components/ShipmentBooking/shipmentShipperQuoteDetails.js";
import ShipmentBookingContract from "./components/ShipmentBooking/ShipmentBookingContract.js";
import ShipmentBookingContractDetails from "./components/ShipmentBooking/ShipmentBookingContractDetails.js";
import { ShipmentBookingShipperContract } from "./components/ShipmentBooking/ShipmentShipperContract.js";
import ShipmentBookingShipperContractDetails from "./components/ShipmentBooking/ShipmentShipperContractDetails.js";
import ShipmentBookingMarketPlace from "./components/ShipmentBooking/ShipmentBookingMarketPlace.js";
import exporterManagement from "./components/myCounterPartComp/exporterManagement.js";
import Einvoice from "./components/Edocs/Einvoice.js";
import EPO from "./components/Edocs/EPO.js";
import ELC from "./components/Edocs/ELC.js";
import EBL from "./components/Edocs/EBL.js";
import TCIQuote from "./components/InsuaranceNew/TCIQuote.js";
import TCIFinancierQuote from "./components/InsuaranceNew/TCIFinancierQuote.js";
import TCIFinancierSendQuote from "./components/InsuaranceNew/TCIFinancierSendQuote.js";
import TCIQuoteDetails from "./components/InsuaranceNew/TCIQuoteDetails.js";
import GSTBasedInvoiceFinance from "./components/ondc/GSTBasedInvoiceFinance.js";
import ShipmentBookingTracking from "./components/ShipmentBooking/ShipmentBookingTracking.js";
import EWayBill from "./components/Edocs/EWayBill.js";
import logisticManagement from "./components/myCounterPartComp/logisticManagement.js";
import AccountingGroups from "./components/tallyMasters/AccountingGroups.js";
import AccountingLedgers from "./components/tallyMasters/AccountingLedgers.js";
import AccountingCurrency from "./components/tallyMasters/AccountingCurrency.js";
import TradeGpt from "./components/chatRoom/TradeGpt.js";
import AccountingVouchers from "./components/tallyMasters/AccountingVouchers.js";
import InventoryGroups from "./components/tallyMasters/InventoryGroups.js";
import InventoryCategory from "./components/tallyMasters/InventoryCategory.js";
import InventoryGodown from "./components/tallyMasters/InventoryGodown.js";
import Voucher from "./components/tallyTxns/Voucher.js";
import FillFormONDC from "./components/ondc/FillFormONDC.js";
import GSTBasedInvoiceFinanceProductCatalogue from "./components/ondc/GSTBasedInvoiceFinanceProductCatalogue.js";
import BulkBreak from "./components/commodityFormandMaster/BulkBreak.js";
import PerformDigitalSign from "./components/InvoiceDiscounting/components/PerformDigitalSign.js";
import HSNCodeFinder from "./components/commodityFormandMaster/HSNCodeFinder.js";

import TallyDashboard from "./components/tallyReports/tallyReportsDashboard.js";
import TrackSupportTicket from "./components/helpSupport/TrackSupportTicket.js";
import InvoiceModule from './components/Edocs/Invoice.js'
import VendorPayments from './components/tallyMasters/VendorPayments.js';
import ReceiptNotes from './components/Edocs/ReceiptNotes.js';
import CreditNotes from './components/Edocs/CreditNotes.js';
import DebitNotes from './components/Edocs/DebitNotes.js';
import SalesOrder from './components/Edocs/SalesOrder.js';
import TallyTransactionsBankStatement from './components/tallyTxns/TallyTransactionsBankStatement.js';
import TallyTransactionsBankStatementDetails from './components/tallyTxns/TallyTransactionsBankStatementDetails.js';
import RaiseQuoteSeaRates from './components/ShipmentBooking/RaiseQuoteSeaRates.js';
import SeaRatesSpotRate from './components/ShipmentBooking/SeaRatesSpotRate.js';
import RazorpayxBankIntegration from './components/tallyMasters/RazorpayxBankIntegration.js';
import OpenMoneyBankIntegration from './components/tallyMasters/OpenMoneyBankIntegration.js';
import DeliveryChallan from "./components/Edocs/DeliveryChallan.js";
import CashMemo from "./components/Edocs/CashMemo.js";
import CreateNewSubAdmin from "./components/adminNewUI/SubAdminProfile/CreateNewSubAdmin.js";
import containerContractManagement from "./components/contractManagement/containerContractManagement.js";
import BulkContractManagement from "./components/contractManagement/BulkContractManagement.js";
import inventoryUnits from "./components/tallyMasters/inventoryUnits.js";
import { LogProvider } from './components/contractManagement/OtherServicesLog.js';
import BuyerDiscovery from "./components/ShipmentBooking/buyerdiscovery.js";
import DocumentViewerContainer from "./components/contractManagement/viewDocument.js";
//----------------------------------------------------------------------

//----------------------------------------------------------------------
// get token and user details. Init scoket
let socket;
const userDetails = getUserDataFromCookie();
userDetails.aclMap = userDetails.aclMap ? JSON.parse(userDetails.aclMap) : {};
const token = userDetails.token ? userDetails.token : "";
const hasPlan =
  userDetails.has_plan === 1
    ? true
    : userDetails.has_plan === 0
      ? false
      : "NLI";
const userTypeId = userDetails.type_id ? userDetails.type_id : null;
// const userPermissions = userDetails.UserAccessPermission
//   ? Object.values(JSON.parse(userDetails.UserAccessPermission))
//       .join(",")
//       .split(",")
//   : [];
const userPermissions = userDetails.UserAccessPermission
  ? userDetails.UserAccessPermission
  : null;
console.log(userPermissions, "this is user permission in appjs---->>>");
const sub_user_id = userDetails.sub_user_id ? userDetails.sub_user_id : 0;
const userId = userDetails.user_id ? userDetails.user_id : null;
console.log("token===================>", token);

// if (token && !socket) {
//   initSocket(token).then((socketObj) => {
//     socket = socketObj
//     // console.log("test socket in app.js-->", socketObj)
//   })
// }
//----------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
// App function
function App() {
  const items = useSelector((state) => state.NavConfiguration.navbarItems);
  console.log(items, "itemssss");
  let onlyAllowedUrl = localStorage.getItem("onlyAllowedUrl");
  console.log(onlyAllowedUrl);
  if (onlyAllowedUrl && !window.location.href.includes(onlyAllowedUrl)) {
    removeCookieandAvatar();
    localStorage.clear();
    window.location.reload();
  }

  console.log("userTokenDetails=======>", userDetails);
  const arrpermission = [];
  useEffect(() => { }, []);

  // Defination of private route
  const PrivateRoute = ({ component: Component, ...props }) => {
    let isAccess = true;

    if (props.path.split("/")[1] == "dashboard") {
      isAccess = true;
    } else if (sub_user_id === userId) {
      isAccess = true;
    } else if (sub_user_id !== 0 && sub_user_id !== null) {
      if (userPermissions.includes(props.path.split("/")[1])) {
        isAccess = true;
      } else {
        isAccess = false;
      }
    }

    if (isAccess) {
      return (
        <Route
          {...props}
          render={(innerProps) =>
            token ? (
              <Component userTokenDetails={userDetails} {...innerProps} />
            ) : (
              <Redirect to="/login" />
            )
          }
        />
      );
    } else {
      return (
        <Route
          {...props}
          render={(innerProps) =>
            token ? <Redirect to="/dashboard" /> : <Redirect to="/login" />
          }
        />
      );
    }
  };

  if (token) {
    // Initiate inactivity watcher if user is logged in
    inactivityWatcher();
  }
  // useEffect(() => {
  //   if (userId) {
  //     call("POST", "getNavBarConfig", { userId, userTypeId })
  //       .then((result) => {
  //         console.log(result, "this is result--->>>>>>>>")
  //         if (userPermissions !== null) {
  //           console.log(userPermissions, "this is user perm");
  //           let arr = [];
  //           let val;

  //           try {
  //             val = JSON.parse(userPermissions);
  //           } catch (error) {
  //             console.error("Error parsing userPermissions:", error);
  //             return;
  //           }

  //           if (!Array.isArray(val)) {
  //             console.error("Parsed userPermissions is not an array");
  //             return;
  //           }

  //           val.forEach((item) => {
  //             if (!Array.isArray(item.sideBarId)) {
  //               console.error("sidebarId is not an array for item:", item);
  //               return;
  //             }

  //             item.sideBarId.forEach((id) => {
  //               arr.push(id);
  //             });
  //           });

  //           console.log(arr, "Array of sidebarIds:");

  //           const res = arr.length > 0 ? result.filter((ele) => arr.includes(ele.id)) : result;

  //           console.log(res, "Filtered result:");

  //           store.dispatch(setNavbarConfiguration(res));
  //         } else {
  //           console.log("its else---->>>>>")
  //           store.dispatch(setNavbarConfiguration(result));
  //         }

  //       })
  //       .catch((e) => {
  //         if (userTypeId / 1 == 5) {
  //           store.dispatch(setNavbarConfiguration(shipperConfig));
  //         }
  //         if (userTypeId === 19 || userTypeId === 21) {
  //           store.dispatch(setNavbarConfiguration(exportersNavConfig));
  //         }
  //         if (userTypeId === 8 || userTypeId == 22) {
  //           store.dispatch(setNavbarConfiguration(FinanciersNavConfig));
  //         }
  //         if (userTypeId === 1) {
  //           store.dispatch(setNavbarConfiguration(AdminConfig));
  //         }
  //         if (userTypeId === 3) {
  //           store.dispatch(setNavbarConfiguration(buyersNavConfig));
  //         }
  //         if (userTypeId === 20) {
  //           store.dispatch(setNavbarConfiguration(CPNavConfig));
  //         }
  //       });
  //   }
  // }, []);

  useEffect(() => {
    if (userId) {
      call("POST", "getNavBarConfig", { userId, userTypeId })
        .then((result) => {
          console.log(result, "this is result--->>>>>>>>");
          if (typeof userPermissions === "object" && userPermissions !== null && userPermissions.mainAdmin) {
            console.log("User is mainAdmin, skipping logic.");
            store.dispatch(setNavbarConfiguration(result));
            return;
          }

          if (userPermissions !== null) {
            console.log(userPermissions, "this is user");
            let arr = [];
            let val;

            // Parse userPermissions safely
            try {
              val = JSON.parse(userPermissions);
            } catch (error) {
              console.error("Error parsing userPermissions:", error);
              // Fallback to a default configuration based on userTypeId if parsing fails
              handleFallbackConfig(userTypeId);
              return;
            }

            // Ensure val is an array
            if (!Array.isArray(val)) {
              console.error("Parsed userPermissions is not an array");
              handleFallbackConfig(userTypeId);
              return;
            }

            // Extract sidebarIds and populate arr
            val.forEach((item) => {
              if (Array.isArray(item.sideBarId)) {
                item.sideBarId.forEach((id) => arr.push(id));
              } else {
                console.error("sidebarId is not an array for item:", item);
              }
            });

            console.log(arr, "Array of sidebarIds:");

            // Filter result based on sidebarIds in arr
            const res = arr.length > 0 ? result.filter((ele) => arr.includes(ele.id)) : result;
            console.log(res, "Filtered result:");

            store.dispatch(setNavbarConfiguration(res));
          } else {
            console.log("its else---->>>>>");
            store.dispatch(setNavbarConfiguration(result));
          }
        })
        .catch((e) => {
          console.error("Error fetching navbar config:", e);
          handleFallbackConfig(userTypeId);
        });
    }
  }, [userId, userPermissions, userTypeId]);

  // Function to handle fallback configuration based on userTypeId
  const handleFallbackConfig = (userTypeId) => {
    switch (userTypeId) {
      case 5:
        store.dispatch(setNavbarConfiguration(shipperConfig));
        break;
      case 19:
      case 21:
        store.dispatch(setNavbarConfiguration(exportersNavConfig));
        break;
      case 8:
      case 22:
        store.dispatch(setNavbarConfiguration(FinanciersNavConfig));
        break;
      case 1:
        store.dispatch(setNavbarConfiguration(AdminConfig));
        break;
      case 3:
        store.dispatch(setNavbarConfiguration(buyersNavConfig));
        break;
      case 20:
        store.dispatch(setNavbarConfiguration(CPNavConfig));
        break;
      default:
        console.warn("No configuration found for userTypeId:", userTypeId);
        break;
    }
  };


  useEffect(() => {
    if (userId) {
      call("POST", "setNavBarConfig", {
        userId,
        details: JSON.stringify(items),
        userTypeId,
      })
        .then((result) => { console.log(result, "this is to check navbar result--....") })
        .catch((e) => { });
    }
  }, [items]);
  return (

    <Router>
              <PrivateRoute path="/taskManager" exact component={TaskManager} />
              <PrivateRoute path="/enquiry" exact component={EnquiryList} />
              <PrivateRoute path="/callList" exact component={CallList} />
              <PrivateRoute path="/corporate" exact component={Corporate} />
              <PrivateRoute path="/financier" exact component={Financer} />
      <PrivateRoute path="/usersonboard" exact component={UserOnboard} />
      <PrivateRoute path="/dashboard" exact component={DashboardV2} />

                <PrivateRoute path="/leads" exact component={LeadsComponent} />
                <PrivateRoute path="/crmdata" exact component={CRMFolderComponent} />
                <PrivateRoute path="/crmdatalist" exact component={CRMDataComponent} />
                <PrivateRoute path="/masterdata" exact component={CRMMasterData} />
    </Router>

  )
}

export default App;
