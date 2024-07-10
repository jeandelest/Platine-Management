import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import { z } from "zod";
import { useForm } from "../../hooks/useForm.ts";
import { APISchemas } from "../../types/api.ts";
import { Field } from "../Form/Field.tsx";
import Stack from "@mui/material/Stack";
import { useFetchMutation } from "../../hooks/useFetchQuery.ts";
import { AddressFormFields } from "../Form/AddressFormFields.tsx";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  contact: APISchemas["ContactFirstLoginDto"];
  onSave: () => void;
};

export const addressSchema = z
  .object({
    streetNumber: z.string().optional(),
    repetitionIndex: z
      .string()
      .nullable()
      .transform(val => (val === null ? "" : val))
      .optional(),
    streetType: z
      .string()
      .nullable()
      .transform(val => (val === null ? "" : val))
      .optional(),
    streetName: z.string().optional(),
    addressSupplement: z
      .string()
      .nullable()
      .transform(val => (val === null ? "" : val))
      .optional(),
    specialDistribution: z
      .string()
      .nullable()
      .transform(val => (val === null ? "" : val))
      .optional(),
    cedexName: z
      .string()
      .nullable()
      .transform(val => (val === null ? "" : val)),
    cedexCode: z
      .string()
      .nullable()
      .transform(val => (val === null ? "" : val)),
    cityName: z
      .string()
      .nullable()
      .transform(val => (val === null ? "" : val)),
    zipCode: z
      .string()
      .nullable()
      .transform(val => (val === null ? "" : val)),
    countryName: z.string().optional().or(z.literal("")),
    codeChoice: z.string(),
  })
  .superRefine(({ cedexCode, zipCode, cityName, cedexName, codeChoice }, refinementContext) => {
    if (codeChoice === "zipCode" && (zipCode === undefined || zipCode === "")) {
      refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Veuillez saisir un code postal",
        path: ["zipCode"],
      });
    }
    if (codeChoice === "zipCode" && (cityName === undefined || cityName === "")) {
      refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Veuillez saisir une commune.",
        path: ["cityName"],
      });
    }
    if (codeChoice === "cedexCode" && (cedexCode === undefined || cedexCode === "")) {
      refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Veuillez saisir un code cedex.",
        path: ["cedexCode"],
      });
    }
    if (codeChoice === "cedexCode" && (cedexName === undefined || cedexName === "")) {
      refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Veuillez saisir un bureau distributeur.",
        path: ["cedexName"],
      });
    }
  });

const schema = z.object({
  civility: z.enum(["Female", "Male", "Undefined"]),
  lastName: z.string().min(3),
  firstName: z.string().min(3),
  function: z.string().optional(),
  email: z.string().email(),
  phone: z
    .string()
    .nullable()
    .transform(val => (val === null ? "" : val))
    .optional(),
  secondPhone: z.string().optional().or(z.literal("")),
  identificationName: z.string().optional(),
  usualCompanyName: z.string().optional(),
  address: addressSchema,
});

const civilities = [
  { label: "Madame", value: "Female" },
  { label: "Monsieur", value: "Male" },
];

export const repetitionIndexEnum = ["bis"]; //TODO: use real repetition index

export const streetTypeEnum = ["rue", "avenue"]; // TODO: use real street type

export const styles = {
  Grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1px 1fr ",
    gap: "24px",
    paddingTop: "8px",
  },
};

export const ContactFormDialog = ({ open, onClose, contact, onSave }: Props) => {
  const code = contact.address?.zipCode && contact.address.zipCode !== "" ? "zipCode" : "cedexCode";

  const defaultValues = { ...contact, address: { ...contact.address, codeChoice: code } };
  const { register, control, errors, handleSubmit, reset, setValue } = useForm(schema, {
    defaultValues: defaultValues,
  });

  const [codeType, setCodeType] = useState(code);

  const { mutateAsync, isPending } = useFetchMutation("/api/contacts/{id}", "put");

  const onSubmit = handleSubmit(async data => {
    if (codeType === "zipCode") {
      await mutateAsync({
        body: {
          ...data,
          identifier: contact.identifier,
          address: { ...data.address, cedexCode: "", cedexName: "" },
        },
        urlParams: { id: contact.identifier },
      });
      setValue("address.cedexCode", "");
      setValue("address.cedexName", "");
    }
    if (codeType === "cedexCode") {
      await mutateAsync({
        body: {
          ...data,
          identifier: contact.identifier,
          address: { ...data.address, zipCode: "", cityName: "" },
        },
        urlParams: { id: contact.identifier },
      });
      setValue("address.zipCode", "");
      setValue("address.cityName", "");
    }

    onSave();
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} sx={{ ".MuiPaper-root": { maxWidth: "1160px", p: 2 } }}>
      <form action="#" onSubmit={onSubmit}>
        <DialogTitle sx={{ typography: "headlineMedium" }}>{`Modifier les coordonnées ${
          (contact.firstName || contact.lastName) && `de ${contact.firstName} ${contact.lastName}`
        }`}</DialogTitle>
        <DialogContent>
          <Box sx={styles.Grid}>
            <Stack gap={2}>
              <Typography variant="headlineSmall">Informations du contact</Typography>
              <Field
                control={control}
                label="Civilité"
                name="civility"
                type="radios"
                error={errors?.civility?.message}
                options={civilities}
              />
              <Field label="Nom" error={errors.lastName?.message} {...register("lastName")} />
              <Field label="Prénom" error={errors.firstName?.message} {...register("firstName")} />
              <Field label="Fonction" error={errors.function?.message} {...register("function")} />
              <Field label="Adresse courriel" error={errors.email?.message} {...register("email")} />
              <Field label="Téléphone 1" error={errors.phone?.message} {...register("phone")} />
              <Field
                label="Téléphone 2"
                error={errors.secondPhone?.message}
                {...register("secondPhone")}
              />
            </Stack>
            <Divider orientation="vertical" variant="middle" />
            <AddressFormFields
              errors={errors}
              register={register}
              repetitionIndexValue={contact.address?.repetitionIndex}
              streetTypeValue={contact.address?.streetType}
              countryValue={contact.address?.countryName?.toLocaleUpperCase()}
              codeType={code}
              onChangeCodeChoice={e => (
                setCodeType(e.target.value), setValue("address.codeChoice", e.target.value)
              )}
              type="contact"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ gap: 2 }}>
          <Button
            type="reset"
            variant="outlined"
            onClick={handleClose}
            disabled={isPending}
            sx={{ width: "150px" }}
          >
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={isPending} sx={{ width: "150px" }}>
            Valider
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
