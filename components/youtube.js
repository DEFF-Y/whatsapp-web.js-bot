// import filesize from "./filesize.js";
import axios from "axios";
import cheerio from "cheerio";

/*const formatSize = (number) => {
  fileSize = filesize.partial({ base: 2, standard: "jedec" });
  try {
    return filesize(number);
  } catch (e) {
    return "0 MB";
  }
};*/

const shortUrl = async (url) => {
  return (
    await axios.get(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
    )
  ).data;
};

class Youtube {
  constructor() {
    this.headers = {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36 OPR/81.0.4196.61",
      "sec-ch-ua":
        '"Opera GX";v="81", " Not;A Brand";v="99", "Chromium";v="95"',
    };
  }
  search(query) {
    return new Promise(async (resolve, reject) => {
      try {
        const requestData = await axios.get(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(
            query.trim()
          )}`,
          {
            headers: { ...this.headers },
          }
        );
        const $ = cheerio.load(requestData.data);
        let parseSearch;
        for (let i = 0; $("script").length > i; i++) {
          const initialData = $("script")[i];
          const inData = $(initialData)
            .get()[0]
            .children[0]?.data.includes("var ytInitialData = ");
          if (inData) {
            const inDataParse = $("script")[i];
            const inDataJson = $(inDataParse)
              .get()[0]
              .children[0].data.split("var ytInitialData = ")[1]
              .replace(/;/g, "");
            parseSearch = JSON.parse(inDataJson);
          }
        }
        if (typeof parseSearch === "object") {
          const content =
            parseSearch.contents.twoColumnSearchResultsRenderer.primaryContents
              .sectionListRenderer.contents;
          const searchData =
            content.length === 2
              ? content[0].itemSectionRenderer.contents
              : content[1].itemSectionRenderer.contents;
          if (searchData instanceof Error) return reject("error search data");
          const result = new Array();
          for (const getData of searchData) {
            const videosRenderer = getData.videoRenderer;
            if (videosRenderer) {
              const resultData = {
                videoId: videosRenderer.videoId,
                url: `https://www.youtube.com${videosRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
                title: videosRenderer.title.runs[0].text,
                description: videosRenderer.detailedMetadataSnippets
                  ? videosRenderer.detailedMetadataSnippets[0].snippetText
                      .runs[0].text
                  : "Unknown",
                thumbnail:
                  videosRenderer.thumbnail.thumbnails[1]?.url.split("?")[0] ??
                  videosRenderer.thumbnail.thumbnails[0]?.url.split("?")[0] ??
                  "https://api-xcoders.xyz/images/avatar.png",
                duration:
                  videosRenderer.thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer?.text.simpleText.replace(
                    ".",
                    ":"
                  ) || "Unknown",
                published_at:
                  videosRenderer.publishedTimeText?.simpleText || "Unknown",
                views: isNaN(
                  parseInt(
                    videosRenderer.viewCountText.simpleText
                      ?.split(" x ")[0]
                      .replace(/\./g, "")
                  )
                )
                  ? "Unknown"
                  : parseInt(
                      videosRenderer.viewCountText.simpleText
                        ?.split(" x ")[0]
                        .replace(/\./g, "")
                    ),
                isLive: Object.keys(videosRenderer).includes("badges")
                  ? !!/live/i.test(
                      videosRenderer.badges[0].metadataBadgeRenderer.label
                    )
                  : false,
                author: {
                  name: videosRenderer.ownerText.runs[0].text,
                  url: `https://www.youtube.com${videosRenderer.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
                },
              };
              if (
                Object.keys(videosRenderer).includes("badges")
                  ? !!/live/i.test(
                      videosRenderer.badges[0].metadataBadgeRenderer.label
                    )
                  : false
              ) {
                delete resultData.duration;
                delete resultData.uploaded;
                delete resultData.views;
              }
              result.push(resultData);
            }
          }
          resolve(result);
        } else {
          reject("error request");
        }
      } catch (e) {
        reject(e);
      }
    });
  }
  download(url, mp3 = false) {
    return new Promise(async (resolve, reject) => {
      await axios
        .request({
          method: "POST",
          url: "https://api.onlinevideoconverter.pro/api/convert",
          data: { url: arguments[0] },
        })
        .then(async ({ status, statusText, data }) => {
          if (status !== 200) return reject(statusText);
          const metaTitleMedia = data.meta.title;
          const metaDurationMedia = data.meta.duration;
          const metaThumbnailMedia = data.thumb;
          const metaTagMedia = data.meta.tags;
          if (arguments[1] == false) {
            const filterMetadataVideo = data.url.filter(
              (fill) => fill.quality.toString() === "360" ?? "720"
            );
            const chooseMetadataVideo =
              filterMetadataVideo[0] ??
              filterMetadataVideo[1] ??
              filterMetadataVideo[2] ??
              filterMetadataVideo[3];
            const qualityMetadataVideo = chooseMetadataVideo.quality;
            const bytesizeMetadataVideo = chooseMetadataVideo.filesize;
            const formatSizeMetadataVideo = chooseMetadataVideo.filesize;
            const urlMetadataVideo =
              chooseMetadataVideo.url ?? chooseMetadataVideo.info_url;
            const url = await shortUrl(urlMetadataVideo);
            resolve({
              title: metaTitleMedia,
              duration: metaDurationMedia,
              quality: qualityMetadataVideo,
              bytesize: bytesizeMetadataVideo,
              // size: formatSize(formatSizeMetadataVideo),
              thumbnail: metaThumbnailMedia,
              tags: metaTagMedia,
              url,
            });
          } else {
            const filterMetadataAudio = data.url.filter(
              (fill) => fill.audio === true
            );
            const chooseMetadataAudio =
              filterMetadataAudio[0] ??
              filterMetadataAudio[1] ??
              filterMetadataAudio[2] ??
              filterMetadataAudio[3];
            const qualityMetadataAudio = chooseMetadataAudio.quality;
            const bytesizeMetadataAudio = chooseMetadataAudio.filesize;
            const formatSizeMetadataAudio = chooseMetadataAudio.filesize;
            const urlMetadataAudio =
              chooseMetadataAudio.url ?? chooseMetadataAudio.info_url;
            const url = await shortUrl(urlMetadataAudio);
            resolve({
              title: metaTitleMedia,
              duration: metaDurationMedia,
              quality: qualityMetadataAudio,
              bytesize: bytesizeMetadataAudio,
              //size: formatSize(formatSizeMetadataAudio),
              thumbnail: metaThumbnailMedia,
              tags: metaTagMedia,
              url,
            });
          }
        })
        .catch(reject);
    });
  }
  play(query, mp3 = false) {
    return new Promise(async (resolve, reject) => {
      const argumentUrl = await this.search(arguments[0]);
      if ((argumentUrl && argumentUrl[0] && argumentUrl[0].url) === undefined)
        return reject("error searching data");
      await axios
        .request({
          method: "POST",
          url: "https://api.onlinevideoconverter.pro/api/convert",
          data: { url: argumentUrl[0].url },
        })
        .then(async ({ status, statusText, data }) => {
          if (status !== 200) return reject(statusText);
          const metaTitleMedia = data.meta.title;
          const metaDurationMedia = data.meta.duration;
          const metaThumbnailMedia = data.thumb;
          const metaTagMedia = data.meta.tags;
          if (arguments[1] == false) {
            const filterMetadataVideo = data.url.filter(
              (fill) => fill.quality.toString() === "360" ?? "720"
            );
            const chooseMetadataVideo =
              filterMetadataVideo[0] ??
              filterMetadataVideo[1] ??
              filterMetadataVideo[2] ??
              filterMetadataVideo[3];
            const qualityMetadataVideo = chooseMetadataVideo.quality;
            const bytesizeMetadataVideo = chooseMetadataVideo.filesize;
            const formatSizeMetadataVideo = chooseMetadataVideo.filesize;
            const urlMetadataVideo =
              chooseMetadataVideo.url ?? chooseMetadataVideo.info_url;
            const url = await shortUrl(urlMetadataVideo);
            resolve({
              title: metaTitleMedia,
              duration: metaDurationMedia,
              quality: qualityMetadataVideo,
              bytesize: bytesizeMetadataVideo,
             // size: formatSize(formatSizeMetadataVideo),
              thumbnail: metaThumbnailMedia,
              tags: metaTagMedia,
              url,
            });
          } else {
            const filterMetadataAudio = data.url.filter(
              (fill) => fill.audio === true
            );
            const chooseMetadataAudio =
              filterMetadataAudio[0] ??
              filterMetadataAudio[1] ??
              filterMetadataAudio[2] ??
              filterMetadataAudio[3];
            const qualityMetadataAudio = chooseMetadataAudio.quality;
            const bytesizeMetadataAudio = chooseMetadataAudio.filesize;
            const formatSizeMetadataAudio = chooseMetadataAudio.filesize;
            const urlMetadataAudio =
              chooseMetadataAudio.url ?? chooseMetadataAudio.info_url;
            const url = await shortUrl(urlMetadataAudio);
            resolve({
              title: metaTitleMedia,
              duration: metaDurationMedia,
              quality: qualityMetadataAudio,
              bytesize: bytesizeMetadataAudio,
              // size: formatSize(formatSizeMetadataAudio),
              thumbnail: metaThumbnailMedia,
              tags: metaTagMedia,
              url,
            });
          }
        })
        .catch(reject);
    });
  }
  short(url) {
    return new Promise(async (resolve, reject) => {
      const pathUrl = new URL(url);
      const link =
        "https://www.youtube.com/watch?v=" + pathUrl.pathname.split("/")[2];
      this.download(link, false).then(resolve).catch(reject);
    });
  }
}

export { Youtube };
