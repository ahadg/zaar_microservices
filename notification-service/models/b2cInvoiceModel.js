const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
  discount: String,
  tax: String,
  isDiscountPercent: Boolean,
  isTaxPercentage: Boolean,
  item: String,
  additionalDetails: String,
  quantity: String,
  quantityUnit: String,
  unitPrice: String,
  amount: String
}, { _id: false });

const CurrencySchema = new mongoose.Schema({
  _id: String,
  symbol: String,
  code: String,
  type: String
}, { _id: false });

const FundReceptionSchema = new mongoose.Schema({
  type: String,
  accountNumber: String,
  accountTitle: String,
  bankName: String,
  bankAddress: String,
  iBAN: String,
  branchCode: String
}, { _id: false });

const FinanceStatusSchema = new mongoose.Schema({
  attachments: [mongoose.Schema.Types.Mixed]
}, { _id: false });

const FinanceStatusArraySchema = new mongoose.Schema({
  inProgress: FinanceStatusSchema,
  approved: FinanceStatusSchema,
  rejected: FinanceStatusSchema,
  disbursed: FinanceStatusSchema,
  rePayment: FinanceStatusSchema,
  isDefault: FinanceStatusSchema
}, { _id: false });

const FinancingScoreSchema = new mongoose.Schema({
  basicInfoScore: Number,
  filerScore: Number,
  guarantorScore: Number,
  repaymentHistoryScore: Number,
  biometricVerificationScore: Number,
  postDatedChequeScore: Number,
  minimumDaysScore: Number,
  totalCreditScore: String,
  remainingAmount: Number
}, { _id: false });

const InvoiceFinanceObjSchema = new mongoose.Schema({
  financingScore: FinancingScoreSchema,
  advanceKycLoan: [mongoose.Schema.Types.Mixed],
  documents: [mongoose.Schema.Types.Mixed]
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
  currency: CurrencySchema,
  fundReception: FundReceptionSchema,
  financeStatusarray: FinanceStatusArraySchema,
  invoiceFinanceObj: InvoiceFinanceObjSchema,
  acknowledge: {
    attachments: [mongoose.Schema.Types.Mixed]
  },
  isBill: Boolean,
  createdWithoutLogin: Boolean,
  sentInvoicesDeleted: Boolean,
  receivedInvoicesDeleted: Boolean,
  ack: Boolean,
  outstanding: Boolean,
  draft: Boolean,
  rejected: Boolean,
  finance: Boolean,
  financeCheck: Boolean,
  financeRequestAction: String,
  voided: Boolean,
  clientPaid: Boolean,
  paymentConfirmation: Boolean,
  paid: Boolean,
  vendorTaxNumber: String,
  atCreation: Boolean,
  atFinance: Boolean,
  atAck: Boolean,
  atVoid: Boolean,
  atReject: Boolean,
  atPaid: Boolean,
  atConfirmation: Boolean,
  mailLog: Boolean,
  invoiceTags: [String],
  lines: [LineItemSchema],
  financeId: [String],
  invoiceId: String,
  previousInvoiceHash: String,
  creationDate: Date,
  invDate: Date,
  invoiceRef: String,
  vendorId: String,
  actulUserIdForBackend: String,
  vendorLoginType: String,
  clientLoginType: String,
  vendorMobileNumber: String,
  vendorMobileNumberHash: String,
  vendorEmail: String,
  vendorEmailHash: String,
  vendorName: String,
  clientFirstName: String,
  clientLastName: String,
  clientEmail: String,
  clientMobileNumber: String,
  clientMobileNumberHash: String,
  clientEmailHash: String,
  dueDate: Date,
  netAmt: Number,
  description: String,
  clientCountry: String,
  clientCity: String,
  clientDistrict: String,
  clientStreetName: String,
  clientBusinessName: String,
  clientBuldingNo: String,
  clientPostalCode: String,
  clientAdditionalNo: String,
  clientVATNumber: String,
  clientOtherBuyerId: String,
  baseCurrency: String,
  converstionRate: Number,
  totalAmt: String,
  totalTaxAmt: String,
  totalDiscountAmt: Number,
  action: String,
  netAmtFC: Number,
  totalAmtFC: Number,
  totalTaxAmtFC: Number,
  totalDiscountAmtFC: Number,
  netAmtCC: Number,
  invoiceHash: String,
  invoiceTaxType: String,
  supplyDate: Date,
  mail_msg_id: String,
  source: String,
  status: String,
  delivery_status:String,
}, { timestamps: true });

module.exports = mongoose.model('b2cinvoices', InvoiceSchema);
