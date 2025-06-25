
import { useQuery } from '@tanstack/react-query';
import { fastDemoStore } from '@/lib/demo/fastDemoStore';

export const useFastDemoContacts = () => {
  return useQuery({
    queryKey: ['demo-contacts'],
    queryFn: () => fastDemoStore.getContacts(),
    staleTime: Infinity,
    gcTime: Infinity
  });
};

export const useFastDemoEvents = () => {
  return useQuery({
    queryKey: ['demo-events'],
    queryFn: () => fastDemoStore.getEvents(),
    staleTime: Infinity,
    gcTime: Infinity
  });
};

export const useFastDemoKeystones = () => {
  return useQuery({
    queryKey: ['demo-keystones'],
    queryFn: () => fastDemoStore.getKeystones(),
    staleTime: Infinity,
    gcTime: Infinity
  });
};

export const useFastDemoJobApplications = () => {
  return useQuery({
    queryKey: ['demo-job-applications'],
    queryFn: () => fastDemoStore.getJobApplications(),
    staleTime: Infinity,
    gcTime: Infinity
  });
};

export const useFastDemoContact = (id: string) => {
  return useQuery({
    queryKey: ['demo-contact', id],
    queryFn: () => fastDemoStore.getContact(id),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!id
  });
};
