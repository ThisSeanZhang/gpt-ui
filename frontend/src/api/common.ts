export class ApiKeyPair {
  label: string
  value: string

  constructor(label: string, value: string) {
    this.label = label
    this.value = value
  }

  static get_first(pairs: ApiKeyPair[]): ApiKeyPair {
    return pairs.length > 0 ? pairs[0] : new ApiKeyPair("", "");
  }
}

export class PromptPair {
  label: string
  value: string
  example: string

  constructor(label: string, value: string, example: string) {
    this.label = label
    this.value = value
    this.example = example
  }

  static get_first(pairs: PromptPair[]): ApiKeyPair {
    return pairs.length > 0 ? pairs[0] : new ApiKeyPair("", "");
  }
}

export function get_date(): string {
  let date = new Date(); // create a Date object for current time
  let year = date.getFullYear(); // get the full year (4 digits)
  let month = date.getMonth() + 1; // get the month (0-11, so add 1)
  let day = date.getDate(); // get the day of the month (1-31)
  return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
}
