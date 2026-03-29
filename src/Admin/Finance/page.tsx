'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
} from '@mui/material';

import IntakeFilter from './IntakeFilter';
import PieChartSection from './PieChart';
import Statistics from './Statistics';
import FiltersCard from './FiltersCard';
import PaymentsTable from './PaymentsTable';
import PaymentDetails from './PaymentDetails';

import useAxios from '../../AxiosInstance/UseAxios';
import {api} from '../../../lib/api'

interface PaymentRecord {
  id: string;
  studentName: string;
  amount: number;
  paymentDate: string;
  paymentTime: string;
  feeDescription: string;
  transactionStatus: 'paid' | 'pending' | 'failed';
  intake: string;
  currencyType: 'local' | 'international';
}

export default function Finance() {
  const AxiosInstance = useAxios()
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'single' | 'range'>('single');
  const [singleDate, setSingleDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [feeFilter, setFeeFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ApplicationPayments, setApplicationPayments] = useState<PaymentRecord[]>([])
  const [paymentLoader, setPaymentLoader] = useState(false)
  const [intakeOptions, setIntakeOptions] = useState<string[]>([])
  const [intakeFilter, setIntakeFilter] = useState('');
  
  const INTAKE_OPTIONS = async()=>{
    try{
      const response = await api.get('/api/admissions/intake_options')
      setIntakeOptions(response.data)
    }catch(err){
      console.log(err)
    }
  };
 
  // fetch payments
  const FetchApplicationPayments = async()=>{
    try{
      setPaymentLoader(true)
     const response = await AxiosInstance.get('/api/payments/list_payments')
     setApplicationPayments(response.data)
    }catch(err){
      console.log(err)
    }finally{
      setPaymentLoader(false)
    }
  }
  
  useEffect(()=>{
    INTAKE_OPTIONS()
    FetchApplicationPayments()
  }, [])
  
  useEffect(() => {
  if (intakeOptions.length > 0 && !intakeFilter) {
    setIntakeFilter(intakeOptions[0]);
  }
}, [intakeOptions]);

  const filteredPayments = useMemo(() => {
    let filtered = ApplicationPayments;

    // Intake filter (primary filter)
    if (intakeFilter) {
      filtered = filtered.filter((payment) => payment.intake === intakeFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (filterType === 'single' && singleDate) {
      filtered = filtered.filter((payment) => payment.paymentDate === singleDate);
    } else if (filterType === 'range') {
      if (fromDate) {
        filtered = filtered.filter((payment) => payment.paymentDate >= fromDate);
      }
      if (toDate) {
        filtered = filtered.filter((payment) => payment.paymentDate <= toDate);
      }
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((payment) => payment.transactionStatus === statusFilter);
    }

    // Fee type filter
    if (feeFilter) {
      filtered = filtered.filter((payment) => payment.feeDescription === feeFilter);
    }

    return filtered;
  }, [ ApplicationPayments, searchTerm, filterType, singleDate, fromDate, toDate, statusFilter, feeFilter, intakeFilter]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPayment(null);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSingleDate('');
    setFromDate('');
    setToDate('');
    setStatusFilter('');
    setFeeFilter('');
    setPage(0);
  };

  const totalAmount = filteredPayments
    .filter((p) => p.transactionStatus === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const completedCount = filteredPayments.filter(
    (p) => p.transactionStatus === 'paid'
  ).length;

  // Calculate currency distribution
  const localAmount = filteredPayments
    .filter((p) => p.currencyType === 'local' && p.transactionStatus === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const internationalAmount = filteredPayments
    .filter((p) => p.currencyType === 'international' && p.transactionStatus === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const currencyData = [
    {
      name: 'Local (UGX)',
      value: localAmount,
      color: '#8b5cf6',
    },
    {
      name: 'International',
      value: internationalAmount,
      color: '#ec4899',
    },
  ].filter((item) => item.value > 0);

  const paginatedPayments = filteredPayments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Finance & Payments
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Track and manage student payment records
        </Typography>
      </Box>

      {/* Intake Filter Section */}
      <IntakeFilter
        intakeFilter={intakeFilter}
        setIntakeFilter={setIntakeFilter}
        setPage={setPage}
        intakeOptions={intakeOptions}
      />

      {/* Currency Distribution Pie Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>

        {/* pie chart */}
        <PieChartSection
          currencyData={currencyData}
          intakeFilter={intakeFilter}
        />

        {/* Statistics Cards */}
        <Statistics
          totalAmount={totalAmount}
          completedCount={completedCount}
          localAmount={localAmount}
          internationalAmount={internationalAmount}
        />

      </Grid>

      {/* Filters Card */}
      <FiltersCard
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        singleDate={singleDate}
        setSingleDate={setSingleDate}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        feeFilter={feeFilter}
        setFeeFilter={setFeeFilter}
        handleClearFilters={handleClearFilters}
        setPage={setPage}
      />

      {/* Payments Table */}
      <PaymentsTable
        payments={paginatedPayments}
        page={page}
        loader={paymentLoader}
        rowsPerPage={rowsPerPage}
        filteredPaymentsCount={filteredPayments.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onViewDetails={handleViewDetails}
      />

      {/* Payment Details Dialog */}
      <PaymentDetails
        open={dialogOpen}
        payment={selectedPayment}
        onClose={handleCloseDialog}
      />

    </Box>
  );
}
