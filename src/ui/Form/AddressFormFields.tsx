import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Field } from "./Field";
import { Row } from "../Row";
import { countries } from "../../constants/countries";
import { repetitionIndexEnum, streetTypeEnum } from "../Contact/ContactFormDialog";
import { UseFormRegister } from "react-hook-form";
import { Schema, z } from "zod";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Radio } from "@mui/material";

type Props = {
  errors: any;
  register: UseFormRegister<z.TypeOf<Schema>>;
  repetitionIndexValue?: string;
  streetTypeValue?: string;
  countryValue?: string;
  codeType?: string;
  onChangeCodeChoice: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "contact" | "surveyUnit";
};

export const AddressFormFields = ({
  errors,
  register,
  repetitionIndexValue,
  streetTypeValue,
  countryValue,
  codeType,
  onChangeCodeChoice,
  type = "surveyUnit",
}: Props) => {
  const [country, setCountry] = useState(countryValue);
  const [codeChoice, setCodeChoice] = useState(codeType);

  return (
    <Stack gap={2}>
      <Typography variant="headlineSmall" sx={{ pb: 1 }}>
        Adresse du contact
      </Typography>
      <Field
        defaultValue={countryValue}
        type="select"
        label="Pays"
        selectoptions={countries}
        error={errors.address?.countryName?.message}
        {...register("address.countryName")}
        onChange={e => {
          setCountry(e.target.value as string);
        }}
      />
      {type === "surveyUnit" && (
        <Field
          label="Raison sociale"
          error={errors.identificationName?.message}
          {...register("identificationName")}
        />
      )}
      <Row gap={2} justifyContent={"space-between"}>
        <Field
          sx={{ width: "100px" }}
          label="N°"
          error={errors.address?.streetNumber?.message}
          {...register("address.streetNumber")}
        />
        <Box sx={{ width: "160px" }}>
          {!country || country === "FRANCE" ? (
            <Field
              type="select"
              selectoptions={repetitionIndexEnum}
              defaultValue={repetitionIndexValue}
              label="Indice"
              error={errors.address?.repetitionIndex?.message}
              {...register("address.repetitionIndex")}
            />
          ) : (
            <Field
              label="Indice"
              defaultValue={repetitionIndexValue ?? ""}
              error={errors.address?.repetitionIndex?.message}
              {...register("address.repetitionIndex")}
            />
          )}
        </Box>
        {!country || country === "FRANCE" ? (
          <Field
            sx={{ width: "350px" }}
            type="select"
            label="Type de voie"
            selectoptions={streetTypeEnum}
            defaultValue={streetTypeValue}
            error={errors.address?.streetType?.message}
            {...register("address.streetType")}
          />
        ) : (
          <Field
            sx={{ width: "350px" }}
            label="Type de voie"
            defaultValue={streetTypeValue ?? ""}
            error={errors.address?.streetType?.message}
            {...register("address.streetType")}
          />
        )}
      </Row>
      <Field
        label="Nom de la voie"
        error={errors.address?.streetName?.message}
        {...register("address.streetName")}
      />
      <Field
        label="Mention spéciale"
        error={errors.address?.specialDistribution?.message}
        {...register("address.specialDistribution")}
      />
      <Field
        label="Complément"
        error={errors.address?.addressSupplement?.message}
        {...register("address.addressSupplement")}
      />
      <FormControl>
        <FormLabel
          sx={{
            typography: "titleMedium",
            color: "black.main",
            "&.Mui-focused": { color: "black.main" },
          }}
          id="code-choice"
        >
          Sélectionner s’il s’agit d’un code cedex ou postal (*)
        </FormLabel>
        <RadioGroup
          row
          aria-labelledby="radio-buttons-group-code-choice"
          name="codeChoice"
          value={codeChoice}
          onChange={e => {
            setCodeChoice(e.target.value);
            onChangeCodeChoice(e);
          }}
          sx={{
            flexWrap: "nowrap",
            ".MuiFormControlLabel-label": {
              typography: "bodyLarge",
            },
          }}
        >
          <FormControlLabel
            value="cedexCode"
            control={<Radio sx={{ color: "primary.main" }} />}
            label="Code Cedex"
          />
          <FormControlLabel
            value="zipCode"
            control={<Radio sx={{ color: "primary.main" }} />}
            label="Code postal"
          />
        </RadioGroup>
      </FormControl>
      {codeChoice === "zipCode" && (
        <>
          <Field
            label="Code postal *"
            error={errors.address?.zipCode?.message}
            {...register("address.zipCode")}
          />
          <Field
            label="Commune *"
            error={errors.address?.cityName?.message}
            {...register("address.cityName")}
          />
        </>
      )}
      {codeChoice === "cedexCode" && (
        <>
          <Field
            label="Code cedex *"
            error={errors.address?.cedexCode?.message}
            {...register("address.cedexCode")}
          />
          <Field
            label="Bureau distributeur *"
            error={errors.address?.cedexName?.message}
            {...register("address.cedexName")}
          />
        </>
      )}
    </Stack>
  );
};
