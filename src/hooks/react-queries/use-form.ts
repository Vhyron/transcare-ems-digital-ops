import { useQuery } from '@tanstack/react-query';
import {
  listAllForms,
  listAllFormsPaginate,
  listPendingForms,
  listReviewedForms,
} from '../../actions/form_submissions.action';

export const useAllFormsPaginate = ({ 
  page = 1, 
  limit = 20, 
  search = '', 
  statusFilter = '' 
}: {
  page?: number;
  limit?: number;
  search?: string;
  statusFilter?: string;
}) => {
  return useQuery({
    queryKey: ['all_forms_paginate', page, limit, search, statusFilter],
    queryFn: async () => await listAllFormsPaginate(page, limit, search, statusFilter),
    placeholderData: (previousData) => previousData,
  });
};

export const useAllForms = () => {
  return useQuery({
    queryKey: ['all_forms'],
    queryFn: async () => await listAllForms(),
  });
};

export const usePendingForms = () => {
  return useQuery({
    queryKey: ['pending_forms'],
    queryFn: async () => await listPendingForms(),
  });
};

export const useReviewedForms = () => {
  return useQuery({
    queryKey: ['reviewed_forms'],
    queryFn: async () => await listReviewedForms(),
  });
};
