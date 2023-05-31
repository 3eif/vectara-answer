import { createContext, useEffect, useContext, ReactNode, useState } from "react";
import axios from "axios";

interface Config {
  // Search
  config_endpoint?: string;
  config_corpus_id?: string;
  config_customer_id?: string;
  config_api_key?: string;

  // App
  config_app_title?: string;
  config_enable_app_header?: string;
  config_enable_app_footer?: string;

  // App header
  config_app_header_logo_link?: string;
  config_app_header_logo_src?: string;
  config_app_header_logo_alt?: string;
  config_app_header_logo_height?: string;

  // Filters
  config_enable_source_filters?: string;
  config_sources?: string;

  // Search header
  config_search_logo_link?: string;
  config_search_logo_src?: string;
  config_search_logo_alt?: string;
  config_search_logo_height?: string;
  config_search_title?: string;
  config_search_description?: string;
  config_search_placeholder?: string;

  // Auth
  config_authenticate?: string;
  config_google_client_id?: string;

  // Analytics
  config_google_analytics_tracking_code?: string;
}

type ConfigProp = keyof Config;

const requiredConfigVars = ["corpus_id", "customer_id", "api_key", "endpoint"];

type Search = { endpoint?: string; corpusId?: string; customerId?: string; apiKey?: string };

type App = {
  isHeaderEnabled: boolean;
  isFooterEnabled: boolean;
  title: string;
};

type AppHeader = {
  logo: {
    link?: string;
    src?: string;
    alt?: string;
    height?: string;
  };
};

type Source = { value: string; label: string };
type Filters = { isEnabled: boolean; sources: Source[]; sourceValueToLabelMap?: Record<string, string> };

type SearchHeader = {
  logo: {
    link?: string;
    src?: string;
    alt?: string;
    height?: string;
  };
  title?: string;
  description?: string;
  placeholder?: string;
};

type ExampleQuestions = string[];
type Auth = { isEnabled: boolean; googleClientId?: string };
type Analytics = { googleAnalyticsTrackingCode?: string };

interface ConfigContextType {
  isConfigLoaded: boolean;
  missingConfigProps: string[];
  search: Search;
  app: App;
  appHeader: AppHeader;
  filters: Filters;
  searchHeader: SearchHeader;
  exampleQuestions: ExampleQuestions;
  auth: Auth;
  analytics: Analytics;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

const fetchConfig = async () => {
  const headers = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  };
  const result = await axios.post("/config", undefined, headers);
  return result;
};

const fetchQueries = async () => {
  try {
    const result = await fetch("queries.json", {
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const data = await result.json();
    return data;
  } catch (e) {
    console.log("Could not load queries.json Detail: " + e);
  }
};

const isTrue = (value: string | undefined) => value === "True";

const prefixConfig = (config: Record<string, string | undefined>, existingPrefix = "") => {
  const prefixedConfig = Object.keys(config).reduce((accum, key) => {
    if (key.startsWith(existingPrefix)) {
      const unprefixedKey = key.replace(existingPrefix, "config_");
      accum[unprefixedKey] = config[key];
    } else {
      const unprefixedKey = `config_${key}`;
      accum[unprefixedKey] = config[key];
    }
    return accum;
  }, {} as Record<string, string | undefined>);
  return prefixedConfig;
};

export const ConfigContextProvider = ({ children }: Props) => {
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [missingConfigProps, setMissingConfigProps] = useState<string[]>([]);
  const [search, setSearch] = useState<Search>({});
  const [app, setApp] = useState<App>({ isHeaderEnabled: false, isFooterEnabled: false, title: "" });
  const [appHeader, setAppHeader] = useState<AppHeader>({ logo: {} });
  const [filters, setFilters] = useState<Filters>({ isEnabled: false, sources: [], sourceValueToLabelMap: {} });
  const [searchHeader, setSearchHeader] = useState<SearchHeader>({ logo: {} });
  const [exampleQuestions, setExampleQuestions] = useState<ExampleQuestions>([]);
  const [auth, setAuth] = useState<Auth>({ isEnabled: false });
  const [analytics, setAnalytics] = useState<Analytics>({});

  useEffect(() => {
    const loadConfig = async () => {
      let config: Config;

      if (process.env.NODE_ENV === "production") {
        const result = await fetchConfig();
        config = prefixConfig(result.data);
      } else {
        config = prefixConfig(process.env, "REACT_APP_");
      }
      const queriesResponse = await fetchQueries();
      if (queriesResponse) {
        const questions = queriesResponse.questions;
        if (questions) {
          setExampleQuestions(questions);
        }
      }

      setIsConfigLoaded(true);

      const missingConfigProps = requiredConfigVars.reduce((accum, configVarName) => {
        if (config[`config_${configVarName}` as ConfigProp] === undefined) accum.push(configVarName);
        return accum;
      }, [] as string[]);
      setMissingConfigProps(missingConfigProps);

      const {
        // Search
        config_endpoint,
        config_corpus_id,
        config_customer_id,
        config_api_key,

        // App
        config_app_title,
        config_enable_app_header,
        config_enable_app_footer,

        // Filters
        config_enable_source_filters,
        config_sources,

        // App header
        config_app_header_logo_link,
        config_app_header_logo_src,
        config_app_header_logo_alt,
        config_app_header_logo_height,

        // Search header
        config_search_logo_link,
        config_search_logo_src,
        config_search_logo_alt,
        config_search_logo_height,
        config_search_title,
        config_search_description,
        config_search_placeholder,

        // Auth
        config_authenticate,
        config_google_client_id,

        // Analytics
        config_google_analytics_tracking_code
      } = config;

      setSearch({
        endpoint: config_endpoint,
        corpusId: config_corpus_id,
        customerId: config_customer_id,
        apiKey: config_api_key
      });

      setApp({
        title: config_app_title ?? "",
        isHeaderEnabled: isTrue(config_enable_app_header ?? "True"),
        isFooterEnabled: isTrue(config_enable_app_footer ?? "True")
      });

      setAppHeader({
        logo: {
          link: config_app_header_logo_link,
          src: config_app_header_logo_src,
          alt: config_app_header_logo_alt,
          height: config_app_header_logo_height
        }
      });

      const isFilteringEnabled = isTrue(config_enable_source_filters);

      const sources =
        config_sources?.split(",").map((source) => ({
          value: source.toLowerCase(),
          label: source
        })) ?? [];

      const sourceValueToLabelMap = sources.length
        ? sources.reduce((accum, { label, value }) => {
            accum[value] = label;
            return accum;
          }, {} as Record<string, string>)
        : undefined;

      if (isFilteringEnabled && sources.length === 0) {
        console.error(
          'enable_source_filters is set to "True" but sources is empty. Define some sources for filtering or set enable_source_filters to "False"'
        );
      }

      setFilters({
        isEnabled: isFilteringEnabled,
        sources,
        sourceValueToLabelMap
      });

      setSearchHeader({
        logo: {
          link: config_search_logo_link,
          src: config_search_logo_src,
          alt: config_search_logo_alt,
          height: config_search_logo_height
        },
        title: config_search_title,
        description: config_search_description,
        placeholder: config_search_placeholder
      });

      setAuth({
        isEnabled: isTrue(config_authenticate),
        googleClientId: config_google_client_id
      });

      setAnalytics({
        googleAnalyticsTrackingCode: config_google_analytics_tracking_code
      });
    };
    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        isConfigLoaded,
        missingConfigProps,
        search,
        app,
        appHeader,
        filters,
        searchHeader,
        exampleQuestions,
        auth,
        analytics
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfigContext = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfigContext must be used within a ConfigContextProvider");
  }
  return context;
};