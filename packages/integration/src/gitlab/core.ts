/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  getGitLabIntegrationRelativePath,
  GitLabIntegrationConfig,
} from './config';

/**
 * Checks if a URL is already in the GitLab API format for fetching files.
 *
 * @param url - The URL to check
 * @returns true if the URL is already in API format
 */
function isGitLabApiUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.pathname.includes('/api/v4/projects/') &&
      urlObj.pathname.includes('/repository/files/') &&
      urlObj.pathname.endsWith('/raw')
    );
  } catch {
    return false;
  }
}

/**
 * Normalizes a GitLab API URL by ensuring proper formatting.
 * This handles cases where the URL might need the relative path added.
 *
 * @param url - The API URL to normalize
 * @param config - The relevant provider config
 * @returns The normalized URL
 */
function normalizeGitLabApiUrl(
  url: string,
  config: GitLabIntegrationConfig,
): string {
  try {
    const urlObj = new URL(url);
    const relativePath = getGitLabIntegrationRelativePath(config);

    // If we have a relative path and the URL doesn't include it, add it
    if (relativePath && !urlObj.pathname.startsWith(relativePath)) {
      // Ensure pathname starts with / before prepending relativePath
      const pathname = urlObj.pathname.startsWith('/')
        ? urlObj.pathname
        : `/${urlObj.pathname}`;
      urlObj.pathname = `${relativePath}${pathname}`;
    }

    // Ensure ref parameter is properly encoded (re-set it to trigger encoding)
    if (urlObj.searchParams.has('ref')) {
      const ref = urlObj.searchParams.get('ref');
      if (ref) {
        // Remove and re-add to ensure proper encoding
        urlObj.searchParams.delete('ref');
        urlObj.searchParams.set('ref', ref);
      }
    }

    return urlObj.toString();
  } catch (e) {
    throw new Error(`Invalid GitLab API URL: ${url}, ${e}`);
  }
}

/**
 * Given a URL pointing to a file on a provider, returns a URL that is suitable
 * for fetching the contents of the data.
 *
 * @remarks
 *
 * Converts
 * from: https://gitlab.example.com/a/b/blob/master/c.yaml
 * to:   https://gitlab.com/api/v4/projects/a%2Fb/repository/files/c.yaml/raw?ref=master
 * -or-
 * from: https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/filepath
 * to:   https://gitlab.com/api/v4/projects/groupA%2Fteams%2FteamA%2FsubgroupA%2FrepoA/repository/files/filepath/raw?ref=branch
 * -or-
 * Already in API format: https://gitlab.com/api/v4/projects/12345/repository/files/filepath/raw?ref=branch
 * Returns as-is (with normalization)
 *
 * @param url - A URL pointing to a file
 * @param config - The relevant provider config
 * @param token - An optional auth token (not used in path extraction, kept for compatibility)
 * @public
 */
export function getGitLabFileFetchUrl(
  url: string,
  config: GitLabIntegrationConfig,
  _token?: string,
): string {
  // If URL is already in API format, return it directly (with normalization)
  if (isGitLabApiUrl(url)) {
    return normalizeGitLabApiUrl(url, config);
  }
  const projectPath = extractProjectPath(url, config);
  return Promise.resolve(buildProjectUrl(url, projectPath, config).toString());
}

/**
 * Gets the request options necessary to make requests to a given provider.
 *
 * @param config - The relevant provider config
 * @param token - An optional auth token to use for communicating with GitLab. By default uses the integration token
 * @public
 */
export function getGitLabRequestOptions(
  config: GitLabIntegrationConfig,
  token?: string,
): { headers: Record<string, string> } {
  const headers: Record<string, string> = {};

  const accessToken = token || config.token;
  if (accessToken) {
    // OAuth, Personal, Project, and Group access tokens can all be passed via
    // a bearer authorization header
    // https://docs.gitlab.com/api/rest/authentication/#personalprojectgroup-access-tokens
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return { headers };
}

// Converts
// from: https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/filepath
// to:   https://gitlab.com/api/v4/projects/groupA%2Fteams%2FteamA%2FsubgroupA%2FrepoA/repository/files/filepath/raw?ref=branch
export function buildProjectUrl(
  target: string,
  projectPathOrID: string | Number,
  config: GitLabIntegrationConfig,
): URL {
  try {
    const url = new URL(target);

    const branchAndFilePath = url.pathname
      .split('/blob/')
      .slice(1)
      .join('/blob/');
    const [branch, ...filePath] = branchAndFilePath.split('/');
    const relativePath = getGitLabIntegrationRelativePath(config);

    const projectIdentifier = encodeURIComponent(String(projectPathOrID));

    url.pathname = [
      ...(relativePath ? [relativePath] : []),
      'api/v4/projects',
      projectIdentifier,
      'repository/files',
      encodeURIComponent(decodeURIComponent(filePath.join('/'))),
      'raw',
    ].join('/');

    url.search = `?ref=${branch}`;

    return url;
  } catch (e) {
    throw new Error(`Incorrect url: ${target}, ${e}`);
  }
}

/**
 * Extracts the project path from a GitLab URL
 * from: https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/filepath
 * to:   groupA/teams/teamA/subgroupA/repoA
 */
export function extractProjectPath(
  target: string,
  config: GitLabIntegrationConfig,
): string {
  const url = new URL(target);

  if (!url.pathname.includes('/blob/')) {
    throw new Error(
      `Failed extracting project path from ${url.pathname}. Url path must include /blob/.`,
    );
  }

  let repo = url.pathname.split('/-/blob/')[0].split('/blob/')[0];

  // Get gitlab relative path
  const relativePath = getGitLabIntegrationRelativePath(config);

  // Check relative path exist and replace it if it's the case.
  if (relativePath) {
    repo = repo.replace(relativePath, '');
  }

  // Remove leading slash
  return repo.replace(/^\//, '');
}

// Converts
// from: https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/filepath
// to:   https://gitlab.com/api/v4/projects/groupA%2Fteams%2FteamA%2FsubgroupA%2FrepoA/repository/files/filepath/raw?ref=branch
// Also supports ?ref=<ref> query param for branches with forward slashes
export function buildProjectUrl(
  target: string,
  projectPath: string,
  config: GitLabIntegrationConfig,
): URL {
  try {
    const url = new URL(target);

    const branchAndFilePath = url.pathname
      .split('/blob/')
      .slice(1)
      .join('/blob/');

    let branch: string;
    let filePath: string[];

    // Check if ref is provided as a query parameter (useful when branch contains forward slashes)
    const refParam = url.searchParams.get('ref');
    if (refParam) {
      // Use the ref from query parameter
      branch = decodeURIComponent(refParam);
      // The file path is everything after the branch name in the pathname
      const branchSegments = branch.split('/');
      const allSegments = branchAndFilePath.split('/');

      // Find where the branch name ends and file path begins
      // The branch segments should match the first segments of allSegments
      if (
        branchSegments.length <= allSegments.length &&
        branchSegments.every(
          (seg, idx) => seg === decodeURIComponent(allSegments[idx]),
        )
      ) {
        filePath = allSegments.slice(branchSegments.length);
      } else {
        // Fallback: if branch doesn't match, use old behavior
        [branch, ...filePath] = allSegments;
      }
    } else {
      // Default behavior: split on first slash
      [branch, ...filePath] = branchAndFilePath.split('/');
    }

    const relativePath = getGitLabIntegrationRelativePath(config);

    url.pathname = [
      ...(relativePath ? [relativePath] : []),
      'api/v4/projects',
      encodeURIComponent(projectPath),
      'repository/files',
      encodeURIComponent(decodeURIComponent(filePath.join('/'))),
      'raw',
    ].join('/');

    url.search = `?ref=${encodeURIComponent(branch)}`;

    return url;
  } catch (e) {
    throw new Error(`Incorrect url: ${target}, ${e}`);
  }
}
