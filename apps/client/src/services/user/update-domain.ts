import type { UpdateDomainDto, UserDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { axios } from "@/client/libs/axios";
import { queryClient } from "@/client/libs/query-client";

export const updateUserDomain = async (data: UpdateDomainDto) => {
  const response = await axios.patch<UserDto, AxiosResponse<UserDto>, UpdateDomainDto>(
    "/user/domain",
    data,
  );

  return response.data;
};

export const useUpdateUserDomain = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: updateUserDomainFn,
  } = useMutation({
    mutationFn: updateUserDomain,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
    },
  });

  return { updateUserDomain: updateUserDomainFn, loading, error };
};
