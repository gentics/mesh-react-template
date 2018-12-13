import {useState, useEffect} from 'react';

export async function getNavigation() {
  return graphQl(`query Navigation {
    project {
      rootNode {
        children(filter: {schema: {is: category}}) {
          elements {
            uuid
            path
            fields {
              ... on category {
                name
              }
            }
          }
        }
      }
    }
  }`);
}

export function useWebroot(path) {
  return usePromise(() => graphQl(`
  query Webroot($path: String) {
    node(path: $path) {
      schema {
        name
      }
      ...category
      ...product
    }
  }
  ${categoryFragment}
  ${productFragment}
  `, {path}).then(response => response.node), [path])
}

const categoryFragment = `
fragment category on Node {
  fields {
    ... on category {
      name
      description
    }
  }
  children {
    elements {
      uuid
      path
      fields {
        ... on vehicle {
          name
          weight
          description
          SKU
          price
          stocklevel
          vehicleImage {
            path
          }
        }
      }
    }
  }
}`

const productFragment = `
fragment product on Node {
  fields {
    ... on vehicle {
      name
      description
      SKU
      price
      weight
      stocklevel
      vehicleImage {
        path
      }
    }
  }
}`

export function getProject() {
  return get(`/demo`)
}

export function usePromise(promiseFn, changes) {
  const [state, setState] = useState();

  useEffect(() => {
    promiseFn().then(setState)
  }, changes)

  return state;
}

function graphQl(query, variables) {
  return post(`/demo/graphql`, { query, variables }).then(response => response.data);
}

function get(path) {
  return fetch(`/api/v1${path}`)
    .then(response => response.json());
}

function post(path, data) {
  return fetch(`/api/v1${path}`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => response.json());
}