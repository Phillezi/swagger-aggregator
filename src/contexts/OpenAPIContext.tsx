import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  SetStateAction,
  Dispatch,
} from "react";
import { parse } from "@std/yaml";

interface OpenAPISpec {
  url: string;
  status?: "up" | "down";
  rtt?: number;
  spec: object | string | undefined;
  initialized: boolean;
}

interface OpenAPIContextType {
  openAPIURLs: Map<string, OpenAPISpec> | undefined;
  lastFetched: number;
  refetch: () => void;
  ui: "swagger" | "scalar";
  setUI: Dispatch<SetStateAction<"swagger" | "scalar">>;
}

const OpenAPIContext = createContext<OpenAPIContextType | undefined>(undefined);

export const useOpenAPI = (): OpenAPIContextType => {
  const context = useContext(OpenAPIContext);
  if (!context) {
    throw new Error("useOpenAPI must be used within a OpenAPIContextProvider");
  }
  return context;
};

interface OpenAPIContextProviderProps {
  children: ReactNode;
}

function generateUrlMap(urls: string[]): Map<string, string> {
  const urlMap = new Map<string, string>();

  urls.forEach((url) => {
    try {
      const parsedUrl = new URL(url);
      const hostnameParts = parsedUrl.hostname.split(".");
      const pathnameParts = parsedUrl.pathname.split("/").filter(Boolean);

      let nameParts: string[] = [];

      if (hostnameParts.length > 2) {
        // Include subdomains but exclude common TLDs like .se .com, .net, etc.
        nameParts.push(...hostnameParts.slice(0, -1));
      } else {
        // Use the main domain if no subdomain
        nameParts.push(hostnameParts[0]);
      }

      if (pathnameParts.length > 0) {
        nameParts.push(pathnameParts[0]);
      }

      let name = nameParts.join("-");

      let counter = 1;
      let uniqueName = name;
      while (urlMap.has(uniqueName)) {
        uniqueName = `${name}-${counter++}`;
      }

      urlMap.set(uniqueName, url);
    } catch (error) {
      console.error(`Invalid URL skipped: ${url}`);
    }
  });

  return urlMap;
}

const nameURLMap = generateUrlMap(
  import.meta.env.VITE_OPENAPI_URLS
    ? import.meta.env.VITE_OPENAPI_URLS.split(",")
    : []
);

function getDefaultOpenAPIURLsNoSpec(
  nameURLMap: Map<string, string>
): Map<string, OpenAPISpec> {
  const urlMap = new Map<string, OpenAPISpec>();

  for (const [name, url] of nameURLMap) {
    urlMap.set(name, {
      url: url,
      spec: undefined,
      initialized: false,
    });
  }

  return urlMap;
}

async function getDefaultOpenAPIURLs(
  nameURLMap: Map<string, string>
): Promise<Map<string, OpenAPISpec>> {
  const urlMap = new Map<string, OpenAPISpec>();

  const fetchSpecs = Array.from(nameURLMap.entries()).map(
    async ([name, url]) => {
      try {
        const startTime = performance.now();
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch OpenAPI spec from ${url}`);
        }
        const endTime = performance.now(); // End time after fetch
        const rtt = endTime - startTime; // Calculate RTT in milliseconds

        const contentType = response.headers.get("Content-Type");
        let spec;

        if (contentType?.includes("application/json")) {
          // Parse JSON spec
          spec = await response.json();
        } else if (
          contentType?.includes("application/yaml") ||
          contentType?.includes("application/x-yaml") ||
          contentType?.includes("text/yaml")
        ) {
          // Parse YAML spec
          const yamlText = await response.text();
          spec = parse(yamlText);
        } else {
          throw new Error(`Unsupported spec format from ${url}`);
        }
        urlMap.set(name, {
          url,
          spec,
          initialized: true,
          status: "up",
          rtt: rtt,
        });
      } catch (error) {
        console.error(`Error fetching or processing URL: ${url} -`, error);
        if (name)
          urlMap.set(name, {
            url,
            spec: undefined,
            initialized: true,
            status: "down",
          });
      }
    }
  );

  await Promise.all(fetchSpecs);

  return urlMap;
}
export const OpenAPIContextProvider: React.FC<OpenAPIContextProviderProps> = ({
  children,
}) => {
  const [urlCacheMap, setURLCacheMap] = useState<Map<string, object | string>>(
    new Map<string, object | string>()
  );
  const [openAPIURLs, setOpenAPIURLs] = useState<
    Map<string, OpenAPISpec> | undefined
  >(getDefaultOpenAPIURLsNoSpec(nameURLMap));
  useEffect(() => {
    getDefaultOpenAPIURLs(nameURLMap).then((specs) => setOpenAPIURLs(specs));
  }, []);
  const [lastFetched, setLastFetched] = useState<number>(0);
  const [refetchRequested, setRefetchRequested] = useState<boolean>(false);
  const [ui, setUI] = useState<"swagger" | "scalar">("swagger");

  useEffect(() => {
    if (typeof window !== "undefined" && openAPIURLs) {
      const originalFetch = window.fetch;
      window.fetch = async (url, options = {}) => {
        if (urlCacheMap?.has(url.toString())) {
          const cachedSpec = urlCacheMap.get(url.toString());

          const fakeResponse = new Response(JSON.stringify(cachedSpec), {
            status: 200,
            statusText: "OK",
            headers: new Headers({
              "Content-Type": "application/json",
              "Cache-Control": "max-age=3600",
            }),
          });
          Object.defineProperty(fakeResponse, "json", {
            value: async () => cachedSpec,
          });

          Object.defineProperty(fakeResponse, "text", {
            value: async () => JSON.stringify(cachedSpec),
          });

          Object.defineProperty(fakeResponse, "clone", {
            value: () => fakeResponse,
          });

          return await Promise.resolve(fakeResponse);
        }

        return originalFetch(url, options);
      };

      return () => {
        window.fetch = originalFetch;
      };
    }
  }, [urlCacheMap]);

  useEffect(() => {
    if (openAPIURLs) {
      const _urlCacheMap = new Map();

      for (const [_, value] of openAPIURLs.entries()) {
        if (value?.url && value?.spec) {
          _urlCacheMap.set(value.url, value.spec);
        }
      }

      setURLCacheMap(_urlCacheMap);
    }
  }, [openAPIURLs]);

  useEffect(() => {
    setLastFetched(Date.now());
  }, [openAPIURLs]);

  useEffect(() => {
    if (urlCacheMap.size === 0 && refetchRequested) {
      setRefetchRequested(false);
      getDefaultOpenAPIURLs(nameURLMap).then((specs) => setOpenAPIURLs(specs));
    }
  }, [urlCacheMap, refetchRequested]);

  const refetch = () => {
    setURLCacheMap(new Map());
    setRefetchRequested(true);
  };

  return (
    <OpenAPIContext.Provider
      value={{ openAPIURLs, lastFetched, refetch, ui, setUI }}
    >
      {children}
    </OpenAPIContext.Provider>
  );
};
