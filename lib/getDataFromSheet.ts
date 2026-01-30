import Papa from "papaparse"

export interface Rep {
  Rep_Name: string
  Location: string
  Segment: string
}

export interface Account {
  Account_ID: string
  Account_Name: string
  Current_Rep: string
  ARR: number
  Location: string
  Num_Employees: number
  Num_Marketers: number
  Risk_Score: number
}

const DOC_URL =
  "https://docs.google.com/spreadsheets/d/1peVLxvRz_XSps6DCHjrBwE_1kp-Krd_waBz10jvwfww"

// OBS: This function could be more generic by accepting sheet names and URL as parameters
// But for simplicity for this challenge is hardcoded
// *****************************************************************************************
export const getDataFromSheet = async () => {
  const csvReps = await fetch(`${DOC_URL}/gviz/tq?tqx=out:csv&sheet=Reps `).then((res) =>
    res.text(),
  )

  const csvAccounts = await fetch(`${DOC_URL}/gviz/tq?tqx=out:csv&sheet=Accounts `).then((res) =>
    res.text(),
  )

  // console.log({ csvReps, csvAccounts })

  const reps = Papa.parse<Rep>(csvReps, {
    header: true,
    skipEmptyLines: true,
  }).data

  const accounts = Papa.parse<Account>(csvAccounts, {
    header: true,
    skipEmptyLines: true,
    transform: (value, column) => {
      // Automatically convert numeric columns
      if (["ARR", "Risk_Score", "Num_Employees", "Num_Marketers"].includes(column as string)) {
        return Number(value)
      }
      return value
    },
  }).data

  return { reps, accounts }
}
